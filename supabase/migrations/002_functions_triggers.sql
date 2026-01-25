-- ===========================================
-- FUNCIONES Y TRIGGERS
-- ===========================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.socios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nombre, apellido, cedula, rol)
    VALUES (
        NEW.id, NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
        COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
        COALESCE(NEW.raw_user_meta_data->>'cedula', ''),
        'usuario'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generar número de pedido
CREATE SEQUENCE IF NOT EXISTS pedido_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_pedido := 'CS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('pedido_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON public.pedidos
    FOR EACH ROW WHEN (NEW.numero_pedido IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- Generar códigos de entrada
CREATE OR REPLACE FUNCTION generate_entrada_codes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.codigo_qr := 'EVT-' || SUBSTRING(NEW.evento_id::TEXT, 1, 8) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    NEW.token_validacion := ENCODE(GEN_RANDOM_BYTES(32), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_entrada_codes BEFORE INSERT ON public.entradas
    FOR EACH ROW WHEN (NEW.codigo_qr IS NULL)
    EXECUTE FUNCTION generate_entrada_codes();

-- Historial de socios
CREATE OR REPLACE FUNCTION log_socio_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.historial_socios (socio_id, tipo_cambio, estado_nuevo, tipo_socio_nuevo)
        VALUES (NEW.id, 'alta', NEW.estado, NEW.tipo_socio);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.estado != NEW.estado THEN
            INSERT INTO public.historial_socios (socio_id, tipo_cambio, estado_anterior, estado_nuevo)
            VALUES (NEW.id, CASE WHEN NEW.estado = 'activo' THEN 'reactivacion' ELSE 'baja' END, OLD.estado, NEW.estado);
        END IF;
        IF OLD.tipo_socio != NEW.tipo_socio THEN
            INSERT INTO public.historial_socios (socio_id, tipo_cambio, tipo_socio_anterior, tipo_socio_nuevo)
            VALUES (NEW.id, 'cambio_categoria', OLD.tipo_socio, NEW.tipo_socio);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_socio_changes_trigger AFTER INSERT OR UPDATE ON public.socios
    FOR EACH ROW EXECUTE FUNCTION log_socio_changes();

-- ===========================================
-- FUNCIÓN: VALIDAR ENTRADA (escaneo QR)
-- ===========================================

CREATE OR REPLACE FUNCTION validar_entrada(
    p_codigo_qr TEXT,
    p_evento_id UUID,
    p_funcionario_id UUID,
    p_ubicacion TEXT DEFAULT NULL
)
RETURNS TABLE (valida BOOLEAN, mensaje TEXT, entrada_id UUID, nombre_asistente TEXT, tipo_entrada TEXT) AS $$
DECLARE
    v_entrada RECORD;
    v_resultado TEXT;
BEGIN
    SELECT e.*, te.nombre as tipo_nombre INTO v_entrada
    FROM public.entradas e
    JOIN public.tipos_entrada te ON e.tipo_entrada_id = te.id
    WHERE e.codigo_qr = p_codigo_qr;

    IF NOT FOUND THEN
        INSERT INTO public.escaneos_entrada (entrada_id, escaneado_por, resultado, ubicacion_escaneo)
        VALUES (NULL, p_funcionario_id, 'no_encontrada', p_ubicacion);
        RETURN QUERY SELECT false, 'Entrada no encontrada'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT;
        RETURN;
    END IF;

    IF v_entrada.evento_id != p_evento_id THEN
        INSERT INTO public.escaneos_entrada (entrada_id, escaneado_por, resultado, ubicacion_escaneo)
        VALUES (v_entrada.id, p_funcionario_id, 'evento_incorrecto', p_ubicacion);
        RETURN QUERY SELECT false, 'Esta entrada es para otro evento'::TEXT, v_entrada.id, v_entrada.nombre_asistente, v_entrada.tipo_nombre;
        RETURN;
    END IF;

    IF v_entrada.estado = 'usada' THEN
        INSERT INTO public.escaneos_entrada (entrada_id, escaneado_por, resultado, ubicacion_escaneo)
        VALUES (v_entrada.id, p_funcionario_id, 'ya_usada', p_ubicacion);
        RETURN QUERY SELECT false, 'Entrada ya utilizada el ' || TO_CHAR(v_entrada.fecha_uso, 'DD/MM/YYYY HH24:MI'), v_entrada.id, v_entrada.nombre_asistente, v_entrada.tipo_nombre;
        RETURN;
    END IF;

    IF v_entrada.estado = 'cancelada' THEN
        INSERT INTO public.escaneos_entrada (entrada_id, escaneado_por, resultado, ubicacion_escaneo)
        VALUES (v_entrada.id, p_funcionario_id, 'cancelada', p_ubicacion);
        RETURN QUERY SELECT false, 'Entrada cancelada'::TEXT, v_entrada.id, v_entrada.nombre_asistente, v_entrada.tipo_nombre;
        RETURN;
    END IF;

    UPDATE public.entradas SET estado = 'usada', fecha_uso = NOW() WHERE id = v_entrada.id;
    INSERT INTO public.escaneos_entrada (entrada_id, escaneado_por, resultado, ubicacion_escaneo)
    VALUES (v_entrada.id, p_funcionario_id, 'valida', p_ubicacion);
    RETURN QUERY SELECT true, 'Entrada válida - Bienvenido!'::TEXT, v_entrada.id, v_entrada.nombre_asistente, v_entrada.tipo_nombre;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- FUNCIÓN: VERIFICAR PERMISOS DE ESCANEO
-- ===========================================

CREATE OR REPLACE FUNCTION puede_escanear_entradas(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND rol IN ('admin', 'directivo')) THEN
        RETURN true;
    END IF;
    IF EXISTS (
        SELECT 1 FROM public.funcionarios f
        JOIN public.profiles p ON f.profile_id = p.id
        WHERE p.id = user_id AND f.puede_escanear = true AND f.activo = true
    ) THEN
        RETURN true;
    END IF;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- RLS (Row Level Security)
-- ===========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escaneos_entrada ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins pueden ver todos los perfiles" ON public.profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'funcionario')));

-- Socios
CREATE POLICY "Socios pueden ver su propia información" ON public.socios FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admins y funcionarios pueden gestionar socios" ON public.socios FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'funcionario')));

-- Pedidos
CREATE POLICY "Usuarios pueden ver sus propios pedidos" ON public.pedidos FOR SELECT USING (user_id = auth.uid());

-- Tablas públicas
CREATE POLICY "Productos públicos" ON public.productos FOR SELECT TO anon, authenticated USING (activo = true);
CREATE POLICY "Eventos sociales públicos" ON public.eventos_sociales FOR SELECT TO anon, authenticated USING (activo = true AND publicado = true);
CREATE POLICY "Deportes públicos" ON public.deportes FOR SELECT TO anon, authenticated USING (activo = true);
CREATE POLICY "Directivos públicos" ON public.directivos FOR SELECT TO anon, authenticated USING (activo = true);

-- Entradas y escaneo
CREATE POLICY "Usuarios pueden ver sus propias entradas" ON public.entradas FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Personal autorizado puede ver entradas para escaneo" ON public.entradas FOR SELECT USING (puede_escanear_entradas(auth.uid()));
CREATE POLICY "Personal autorizado puede actualizar entradas (escaneo)" ON public.entradas FOR UPDATE USING (puede_escanear_entradas(auth.uid()));
CREATE POLICY "Personal autorizado puede registrar escaneos" ON public.escaneos_entrada FOR INSERT WITH CHECK (puede_escanear_entradas(auth.uid()));
CREATE POLICY "Personal autorizado puede ver escaneos" ON public.escaneos_entrada FOR SELECT USING (puede_escanear_entradas(auth.uid()));
