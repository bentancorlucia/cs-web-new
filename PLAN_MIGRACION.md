# Plan de Migración: Club Seminario a Next.js

Migrar sitio web estático (HTML/CSS/JS) a Next.js 15 con tienda online, sistema de usuarios y área de socios.

---

## Sitio Web Actual

**URL:** https://clubseminario.com.uy

### El Club

Club Seminario fue fundado el **13 de mayo de 2010** como institución deportiva, social y cultural. Nuclea a equipos deportivos de exalumnos, padres y madres del Colegio Seminario que, hasta ese entonces, funcionaban en forma independiente.

- **+1000 socios** activos
- **22 categorías deportivas**
- **+600 partidos anuales** en diversas ligas

El club se posiciona como espacio para practicar deportes y actividades culturales bajo **valores ignacianos**, promoviendo el deporte como estrategia educativa, de integración y recreativa.

### Escudo y Colores

**Escudo:** Los lobos representan la hospitalidad de la familia Loyola.

| Color | Significado |
|-------|-------------|
| Bordó `#730d32` | Sacrificio y entrega |
| Oro `#f7b643` | Voluntad y esfuerzo |

> **Recursos del proyecto anterior (`../cs/img/`):**
> - `logo-cs.png` — Escudo del club ✅ copiado a `public/`
> - Fotos de disciplinas: `hb-masculino.jpg`, `hb-femenino.jpg`, `Rugby.jpg`, `futbol-masculino.jpg`, `futbol-femenino.jpg`, `Hockey.jpg`, `MamiHockey.jpg`, `MamiVolley.jpg`, `Papivolley.jpeg`, `PapiFutbol.jpg`, `Corredores.jpg`
> - Fotos de secciones: `foto-directiva.webp`, `foto-beneficios.webp`, `foto-memorias.webp`, `foto-socios.webp`, `foto-estatuto.webp`, `foto-reglamento.webp`, `foto-cupra.webp`, `foto-futfem.webp`
> - Logos sponsors: `logo-itau.png`, `logo-movistar.png`, `logo-zillertal.png`, `logo-suat.png`, `logo-gatorade.png`, `logo-nb.png`, `logo-ucu.png`, `logo-rc.png`, `logo-summum.png`

### Secciones Existentes

| Sección | Contenido |
|---------|-----------|
| Inicio | Hero, historia, info general |
| Club | Comisión Directiva, Instalaciones, Estatuto, Reglamento, Memorias |
| Disciplinas | Básquetbol, Corredores, Handball, Hockey, Fútbol, Rugby, Volleyball |
| Socios | Información para hacerse socio |
| Beneficios | Convenios y descuentos |
| Tienda | Productos del club |
| Contacto | Datos de contacto |

### Contacto

| Dato | Valor |
|------|-------|
| Teléfono | 099 613 671 |
| Email | secretaria@clubseminario.com.uy |
| Dirección | Soriano 1472, Colegio Seminario, Oficina |
| Horario | Martes, jueves y viernes 10-13 horas |
| Redes | Facebook, Instagram, X |

---

## Stack

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Backend | Supabase Pro (PostgreSQL + Auth + Storage) |
| Pagos | MercadoPago |
| Emails | Resend (transaccionales) |
| Estado | Zustand (carrito) + React Query (datos) |
| Testing | Playwright (E2E flujos críticos) |
| Design Tools | Skills: `frontend-design` + `web-design-guidelines` |

**Identidad visual:** Bordo `#730d32` + Amarillo `#f7b643` · Poppins · Scroll reveal

---

## Skills de Diseño (Claude Code)

### `/frontend-design`
Usar para **crear** interfaces distintivas y de alta calidad:
- Componentes React con diseño pulido
- Landing pages y páginas de marketing
- Dashboards y áreas de usuario
- Layouts HTML/CSS/Tailwind

**Cuándo invocar:** Al construir cualquier página, componente UI, o cuando se necesite estilizar/embellecer la interfaz.

### `/web-design-guidelines`
Usar para **revisar y auditar** código UI:
- Verificar accesibilidad (a11y)
- Auditar cumplimiento de mejores prácticas
- Revisar UX y patrones de diseño
- Validar contra Web Interface Guidelines

**Cuándo invocar:** Después de crear componentes/páginas, antes de dar por terminada una fase de UI.

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (marketing)/        # socios, beneficios, club/*, deportes/*
│   ├── tienda/             # productos/[slug], carrito, checkout
│   ├── eventos/            # [slug], escaneo/[eventoId]
│   ├── (auth)/             # login, registro, recuperar
│   ├── mi-cuenta/          # perfil, pedidos, entradas
│   ├── admin/              # dashboard, productos, eventos, pedidos, reportes
│   └── api/                # mercadopago/*, resend/*
├── components/
│   ├── ui/                 # Button, Card, Input, Modal, Toast, DataTable
│   ├── layout/             # Header, Footer, PageHeader
│   ├── tienda/             # ProductCard, CartDrawer, CheckoutForm
│   ├── eventos/            # EventCard, LoteSelector, QRScanner
│   └── admin/              # Sidebar, StatsCard, ProductForm, EventForm, OrdersTable
├── lib/                    # supabase/, mercadopago/
├── hooks/                  # useAuth, useCart, useScrollReveal
├── stores/                 # cartStore (Zustand)
└── data/                   # beneficios.ts (estático)
```

---

## Base de Datos

> **SQL completo en:** `supabase/migrations/`
> - [001_initial_schema.sql](supabase/migrations/001_initial_schema.sql) — Tablas, índices y vistas
> - [002_functions_triggers.sql](supabase/migrations/002_functions_triggers.sql) — Funciones, triggers y RLS

### Convenciones

| Práctica | Implementación |
|----------|----------------|
| **Primary Keys** | `UUID` con `gen_random_uuid()` |
| **Foreign Keys** | Siempre indexadas |
| **Timestamps** | `timestamptz` (con zona horaria) |
| **Dinero** | `DECIMAL(10,2)` |

### Tablas por Módulo

| Módulo | Tablas |
|--------|--------|
| **Usuarios** | `profiles` |
| **Socios** | `socios` |
| **Personal** | `directivos`, `funcionarios` |
| **Tienda** | `categorias_producto`, `productos`, `variantes_producto` (con stock), `metodos_envio`, `pedidos`, `items_pedido` |
| **Eventos** | `eventos_sociales`, `lotes_entrada`, `tipos_entrada`, `entradas`, `escaneos_entrada` |
| **Contenido** | `deportes`, `memorias` |

### Funciones Principales

| Función | Descripción |
|---------|-------------|
| `handle_new_user()` | Crea profile al registrarse |
| `generate_order_number()` | Genera número de pedido `CS-YYYYMMDD-XXXX` |
| `generate_entrada_codes()` | Genera código QR y token de validación |
| `validar_entrada()` | Valida entrada en escaneo QR |
| `puede_escanear_entradas()` | Verifica permisos de escaneo |
| `check_low_stock()` | Alerta cuando stock < umbral |

### Vistas

| Vista | Uso |
|-------|-----|
| `socios_completos` | Socios con datos de profile |
| `estadisticas_evento` | Métricas de venta/ingreso por evento |
| `reporte_ventas` | Ventas por período para exportación |
| `productos_stock_bajo` | Productos con stock bajo umbral |

### Roles y Permisos

| Rol | Puede |
|-----|-------|
| `usuario` | Comprar, ver público |
| `socio` | + Área socios, precios especiales |
| `funcionario` | + Según tipo y `puede_escanear` |
| `directivo` | + Reportes, gestionar eventos, escanear |
| `admin` | Todo |

---

## Rutas

### Públicas
`/` · `/socios` · `/beneficios` · `/club/*` · `/deportes` · `/deportes/[slug]`

### Tienda
`/tienda` · `/tienda/productos/[slug]` · `/tienda/carrito` · `/tienda/checkout`

### Eventos
`/eventos` · `/eventos/[slug]` · `/eventos/[slug]/checkout` · `/eventos/escaneo`

### Autenticación
`/login` · `/registro` · `/recuperar`

### Mi Cuenta (privadas)
`/mi-cuenta` · `/mi-cuenta/perfil` · `/mi-cuenta/pedidos` · `/mi-cuenta/entradas`

### Admin (rol admin/directivo)
`/admin` · `/admin/productos` · `/admin/eventos` · `/admin/pedidos` · `/admin/reportes`

---

## Fases de Implementación

### Fase 1: Fundamentos ✅
- [x] Copiar escudo del proyecto anterior (`../cs/img/logo-cs.png`) a `public/`
- [x] Copiar imágenes del proyecto anterior (`../cs/img/`) según se necesiten
- [x] Dependencias: `@supabase/ssr`, `tailwindcss`, `@tanstack/react-query`, `zustand`, `html5-qrcode`, `qrcode`, `resend`, `@playwright/test`
- [x] Configurar Tailwind con colores custom
- [x] **`/frontend-design`** → Componentes UI base (Button, Card, Input, Modal, Toast)
- [x] Supabase + migraciones
- [x] **`/web-design-guidelines`** → Auditar componentes base (a11y, contraste, estados)

### Fase 2: Layout ✅
- [x] **`/frontend-design`** → Header con efecto scroll + NavDesktop/NavMobile
- [x] **`/frontend-design`** → Footer
- [x] **`/frontend-design`** → PageHeader (hero páginas internas)
- [x] Hook `useScrollReveal`
- [x] **`/web-design-guidelines`** → Revisar layout completo (navegación, responsive, a11y)

### Fase 3: Páginas Públicas

> **IMPORTANTE:** El contenido textual de todas las páginas debe ser IDÉNTICO al del proyecto anterior (`../cs/`). Solo cambia el diseño visual, no la información.

- [ ] **`/frontend-design`** → Home con video hero
- [ ] **`/frontend-design`** → 5 páginas de Club (directiva, instalaciones, estatuto, reglamento, memorias)
- [ ] **`/frontend-design`** → Deportes con ruta dinámica
- [ ] **`/frontend-design`** → Socios y Beneficios
- [ ] **`/web-design-guidelines`** → Auditoría completa páginas públicas

### Fase 4: Autenticación
- [ ] Supabase Auth
- [ ] **`/frontend-design`** → Formularios (Login, Registro, Recuperar)
- [ ] Middleware rutas protegidas
- [ ] AuthProvider + useAuth
- [ ] **`/web-design-guidelines`** → Revisar formularios (validación, errores, UX)

### Fase 5: Área de Socios
- [ ] **`/frontend-design`** → Dashboard
- [ ] **`/frontend-design`** → Perfil editable
- [ ] **`/frontend-design`** → Historial pedidos
- [ ] **`/frontend-design`** → Mis Entradas
- [ ] **`/web-design-guidelines`** → Auditar área privada (consistencia, navegación, estados)

### Fase 6: Tienda
- [ ] **`/frontend-design`** → Grid productos con filtros
- [ ] **`/frontend-design`** → Detalle con variantes
- [ ] **`/frontend-design`** → Carrito (Zustand)
- [ ] **`/frontend-design`** → Checkout + MercadoPago
- [ ] **`/web-design-guidelines`** → Revisar flujo de compra completo (UX, a11y, mobile)

### Fase 7: Eventos y Entradas
- [ ] **`/frontend-design`** → Listado eventos
- [ ] **`/frontend-design`** → Detalle + selector lotes/tipos
- [ ] **`/frontend-design`** → Checkout entradas (datos asistentes)
- [ ] **`/frontend-design`** → Generación QR + vista entrada
- [ ] **`/frontend-design`** → Sistema de escaneo (funcionarios)
- [ ] **`/web-design-guidelines`** → Auditar flujo de eventos (claridad, mobile-first)

### Fase 8: Panel de Administración
- [ ] **`/frontend-design`** → Layout admin (Sidebar, Header)
- [ ] **`/frontend-design`** → Dashboard con métricas (ventas, pedidos, stock bajo)
- [ ] **`/frontend-design`** → CRUD Productos con gestión de stock
- [ ] **`/frontend-design`** → CRUD Eventos con lotes
- [ ] **`/frontend-design`** → Gestión de pedidos (ver, cambiar estado)
- [ ] **`/frontend-design`** → Reportes exportables (CSV)
- [ ] **`/web-design-guidelines`** → Auditar panel admin (usabilidad, consistencia)

### Fase 9: Emails Transaccionales
- [ ] Configurar Resend
- [ ] Templates: confirmación compra, entrada QR, recordatorio evento
- [ ] Integrar envío en flujos de pago

### Fase 10: Testing E2E
- [ ] Configurar Playwright
- [ ] Tests: flujo de compra tienda
- [ ] Tests: flujo de compra entradas
- [ ] Tests: autenticación
- [ ] Tests: panel admin (CRUD productos)

### Fase 11: SEO y Performance
- [ ] Metadata dinámica
- [ ] Open Graph
- [ ] Sitemap
- [ ] Lighthouse > 90
- [ ] **`/web-design-guidelines`** → Auditoría final global (a11y, UX, patrones, consistencia)

### Fase 12: Deploy
- [ ] Vercel
- [ ] Supabase producción (backups diarios automáticos)
- [ ] Dominio + SSL
- [ ] Sentry

---

## Configuración

### Tailwind (`tailwind.config.ts`)

```typescript
colors: {
  bordo: { DEFAULT: '#730d32', dark: '#5a0a28', light: '#8c103d' },
  amarillo: { DEFAULT: '#f7b643', dark: '#e5a331', light: '#f9c76a' },
},
fontFamily: { sans: ['var(--font-poppins)', 'sans-serif'] },
```

### Variables de Entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# Resend (emails)
RESEND_API_KEY=

# App
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Club Seminario
NEXT_PUBLIC_GA_ID=G-6VDYJBFESE
```

---

## Operaciones

### Panel de Administración
Rutas `/admin/*` dentro del proyecto Next.js para personal no técnico.

| Módulo | Funcionalidades |
|--------|-----------------|
| Dashboard | Métricas de ventas, pedidos recientes, alertas de stock bajo |
| Productos | CRUD, gestión de variantes, stock por variante, imágenes |
| Eventos | CRUD, configuración de lotes, ver ventas en tiempo real |
| Pedidos | Listado, cambiar estado, ver detalles |
| Envíos | Configurar métodos y costos por zona |
| Reportes | Exportar ventas y operaciones a CSV |

### Inventario
- Stock controlado por variante de producto
- Alertas automáticas cuando stock < umbral definido
- Bloqueo de compra cuando stock = 0

### Envíos
| Método | Costo | Gestión |
|--------|-------|---------|
| Retiro en sede | Gratis | Usuario retira en el club |
| Envío Montevideo | Fijo (configurable) | Admin gestiona en [DACommerce](https://dacommerce.dac.com.uy) |
| Envío Interior | Fijo (configurable) | Admin gestiona en [DACommerce](https://dacommerce.dac.com.uy) |

**Flujo de envío:**
1. Usuario elige método en checkout → paga costo fijo
2. Admin recibe pedido → ingresa a DACommerce → genera envío
3. Admin copia número de tracking al sistema
4. Usuario ve tracking en `/mi-cuenta/pedidos`

> **Fase futura:** Integración API con DAC para automatizar cotización y tracking

### Backups
- Supabase Pro con backups diarios automáticos
- Retención de 7 días con point-in-time recovery

### Emails (Resend)
| Trigger | Email |
|---------|-------|
| Compra tienda | Confirmación con detalle del pedido |
| Compra entrada | QR adjunto + datos del evento |
| 24h antes evento | Recordatorio con QR |
| Recuperar contraseña | Link de reset |

### Testing (Playwright)
Tests E2E para flujos críticos:
- Flujo completo de compra en tienda (agregar al carrito → checkout → pago)
- Flujo de compra de entradas (selección → datos asistentes → pago)
- Autenticación (registro, login, recuperar contraseña)
- Panel admin (CRUD de productos)

---

## Flujos Clave

### Compra de Entradas
1. Usuario ve evento → selecciona lote activo → elige tipo y cantidad
2. Completa datos de asistentes → paga con MercadoPago
3. Recibe QRs únicos en `/mi-cuenta/entradas`

### Escaneo QR
1. Funcionario autorizado accede a `/eventos/escaneo`
2. Selecciona evento → activa cámara → escanea QR
3. Sistema valida y muestra resultado (verde/rojo)
4. Se registra en log de auditoría

---

## Verificación Final

- [ ] Páginas públicas migradas
- [ ] Auth funciona
- [ ] Carrito persiste
- [ ] Pagos completan (tienda + eventos)
- [ ] QRs se generan y validan
- [ ] Emails transaccionales se envían
- [ ] Panel admin funcional (productos, eventos, pedidos)
- [ ] Stock se actualiza y alertas funcionan
- [ ] Reportes exportan correctamente
- [ ] Tests E2E pasan
- [ ] Lighthouse > 90
- [ ] Responsive (móvil/tablet/desktop)
- [ ] **`/web-design-guidelines`** pasada sin issues críticos
