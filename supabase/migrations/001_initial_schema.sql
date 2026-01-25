-- ===========================================
-- CLUB SEMINARIO - ESQUEMA INICIAL
-- ===========================================

-- ===========================================
-- USUARIOS Y AUTENTICACIÓN
-- ===========================================

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    cedula TEXT UNIQUE NOT NULL,
    fecha_nacimiento DATE,
    direccion TEXT,
    ciudad TEXT,
    avatar_url TEXT,
    rol TEXT NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'socio', 'directivo', 'funcionario', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_cedula ON public.profiles(cedula);

-- ===========================================
-- SOCIOS
-- ===========================================

CREATE TABLE public.socios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    cedula TEXT NOT NULL UNIQUE,
    tipo_socio TEXT NOT NULL CHECK (tipo_socio IN ('social', 'deportivo')),
    estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    deporte_principal TEXT,
    deportes_adicionales TEXT[],
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_socios_cedula ON public.socios(cedula);

CREATE TABLE public.historial_socios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    socio_id UUID REFERENCES public.socios(id) ON DELETE CASCADE,
    tipo_cambio TEXT NOT NULL,
    estado_anterior TEXT,
    estado_nuevo TEXT,
    tipo_socio_anterior TEXT,
    tipo_socio_nuevo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- DIRECTIVOS Y FUNCIONARIOS
-- ===========================================

CREATE TABLE public.directivos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cedula TEXT NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    cargo TEXT NOT NULL,
    tipo_cargo TEXT NOT NULL CHECK (tipo_cargo IN ('titular', 'suplente', 'fiscal')),
    email TEXT,
    telefono TEXT,
    foto_url TEXT,
    periodo_inicio DATE,
    periodo_fin DATE,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- DEPORTES (debe crearse antes de funcionarios)
-- ===========================================

CREATE TABLE public.deportes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_header TEXT,
    imagen_card TEXT,
    icono TEXT,
    horarios_practica TEXT,
    lugar_practica TEXT,
    contacto_nombre TEXT,
    contacto_telefono TEXT,
    contacto_email TEXT,
    instagram TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0
);

CREATE TABLE public.funcionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cedula TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    cargo TEXT NOT NULL,
    tipo_funcionario TEXT NOT NULL CHECK (tipo_funcionario IN ('deportivo', 'cupra', 'administrativo')),
    deporte_id UUID REFERENCES public.deportes(id),
    categoria_deportiva TEXT,
    email TEXT,
    telefono TEXT,
    foto_url TEXT,
    puede_escanear BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_funcionarios_deporte ON public.funcionarios(deporte_id);
CREATE INDEX idx_funcionarios_tipo ON public.funcionarios(tipo_funcionario);

-- ===========================================
-- E-COMMERCE
-- ===========================================

CREATE TABLE public.categorias_producto (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url TEXT,
    orden INTEGER DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    descripcion_corta TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2),
    categoria_id UUID REFERENCES public.categorias_producto(id),
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    imagenes TEXT[],
    imagen_principal TEXT,
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    deporte TEXT,
    tallas TEXT[],
    colores TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.variantes_producto (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    talla TEXT,
    color TEXT,
    stock INTEGER DEFAULT 0,
    precio_adicional DECIMAL(10,2) DEFAULT 0,
    sku TEXT UNIQUE
);

-- ===========================================
-- PEDIDOS
-- ===========================================

CREATE TABLE public.pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_pedido TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id),
    email TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    direccion_envio TEXT,
    ciudad TEXT,
    notas TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado')),
    metodo_pago TEXT,
    mercadopago_preference_id TEXT,
    mercadopago_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.items_pedido (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id),
    variante_id UUID REFERENCES public.variantes_producto(id),
    nombre_producto TEXT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    talla TEXT,
    color TEXT,
    subtotal DECIMAL(10,2) NOT NULL
);

-- ===========================================
-- EVENTOS SOCIALES
-- ===========================================

CREATE TABLE public.eventos_sociales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    descripcion_corta TEXT,
    fecha_evento TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ,
    hora_apertura TIME,
    hora_cierre TIME,
    ubicacion TEXT,
    direccion TEXT,
    imagen_url TEXT,
    imagenes_galeria TEXT[],
    capacidad_total INTEGER,
    edad_minima INTEGER,
    incluye TEXT[],
    solo_socios BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    publicado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eventos_sociales_fecha ON public.eventos_sociales(fecha_evento);

CREATE TABLE public.lotes_entrada (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id UUID REFERENCES public.eventos_sociales(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lotes_fecha ON public.lotes_entrada(fecha_inicio, fecha_fin);

CREATE TABLE public.tipos_entrada (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lote_id UUID REFERENCES public.lotes_entrada(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_socio DECIMAL(10,2),
    cantidad_total INTEGER NOT NULL,
    cantidad_vendida INTEGER DEFAULT 0,
    max_por_compra INTEGER DEFAULT 10,
    incluye TEXT[],
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.entradas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id UUID REFERENCES public.eventos_sociales(id),
    lote_id UUID REFERENCES public.lotes_entrada(id),
    tipo_entrada_id UUID REFERENCES public.tipos_entrada(id),
    user_id UUID REFERENCES public.profiles(id),
    pedido_id UUID REFERENCES public.pedidos(id),
    codigo_qr TEXT UNIQUE NOT NULL,
    token_validacion TEXT UNIQUE NOT NULL,
    nombre_asistente TEXT NOT NULL,
    cedula_asistente TEXT,
    email_asistente TEXT,
    telefono_asistente TEXT,
    estado TEXT DEFAULT 'valida' CHECK (estado IN ('valida', 'usada', 'cancelada', 'transferida')),
    fecha_compra TIMESTAMPTZ DEFAULT NOW(),
    fecha_uso TIMESTAMPTZ,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entradas_codigo_qr ON public.entradas(codigo_qr);
CREATE INDEX idx_entradas_token ON public.entradas(token_validacion);
CREATE INDEX idx_entradas_evento ON public.entradas(evento_id);
CREATE INDEX idx_entradas_estado ON public.entradas(estado);

CREATE TABLE public.escaneos_entrada (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entrada_id UUID REFERENCES public.entradas(id) ON DELETE CASCADE,
    escaneado_por UUID REFERENCES public.profiles(id),
    resultado TEXT NOT NULL CHECK (resultado IN ('valida', 'ya_usada', 'cancelada', 'no_encontrada', 'evento_incorrecto')),
    ip_address TEXT,
    user_agent TEXT,
    ubicacion_escaneo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escaneos_entrada ON public.escaneos_entrada(entrada_id);
CREATE INDEX idx_escaneos_fecha ON public.escaneos_entrada(created_at);

-- ===========================================
-- MEMORIAS
-- ===========================================

CREATE TABLE public.memorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    anio INTEGER NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    archivo_url TEXT NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- ===========================================
-- VISTAS
-- ===========================================

CREATE OR REPLACE VIEW public.socios_completos AS
SELECT s.*, p.email, p.nombre as nombre_cuenta, p.apellido as apellido_cuenta, p.telefono, p.direccion, p.ciudad
FROM public.socios s
LEFT JOIN public.profiles p ON s.profile_id = p.id;

CREATE OR REPLACE VIEW public.estadisticas_evento AS
SELECT
    e.id as evento_id, e.titulo, e.fecha_evento, e.capacidad_total,
    COUNT(DISTINCT ent.id) as total_vendidas,
    COUNT(DISTINCT ent.id) FILTER (WHERE ent.estado = 'usada') as total_ingresadas,
    COUNT(DISTINCT ent.id) FILTER (WHERE ent.estado = 'valida') as pendientes_ingreso,
    COUNT(DISTINCT ent.id) FILTER (WHERE ent.estado = 'cancelada') as canceladas,
    SUM(te.precio) as ingresos_totales
FROM public.eventos_sociales e
LEFT JOIN public.entradas ent ON e.id = ent.evento_id
LEFT JOIN public.tipos_entrada te ON ent.tipo_entrada_id = te.id
GROUP BY e.id, e.titulo, e.fecha_evento, e.capacidad_total;
