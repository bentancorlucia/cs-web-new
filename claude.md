# Club Seminario - Proyecto Next.js

## Descripcion del Proyecto

Sitio web oficial del Club Seminario (Uruguay). Incluye:
- Paginas institucionales (club, deportes, socios, beneficios)
- Tienda online con carrito y checkout (MercadoPago)
- Sistema de eventos con venta de entradas y escaneo QR
- Panel de administracion
- Area de usuario (mi cuenta, pedidos, entradas)

## Stack Tecnologico

- **Framework**: Next.js 16 (App Router, Turbopack)
- **React**: 19
- **TypeScript**: 5
- **Estilos**: Tailwind CSS 4
- **Base de datos**: Supabase (PostgreSQL)
- **Estado global**: Zustand
- **Data fetching**: TanStack Query
- **Formularios**: React Hook Form
- **Pagos**: MercadoPago
- **Emails**: Resend
- **Monitoreo**: Sentry
- **Testing**: Playwright (e2e)
- **Deploy**: Vercel

## Estructura del Proyecto

```
src/
├── app/
│   ├── (site)/          # Paginas publicas con Header/Footer
│   │   ├── page.tsx     # Home
│   │   ├── tienda/      # Tienda, carrito, checkout
│   │   ├── eventos/     # Eventos y entradas
│   │   ├── deportes/    # Secciones deportivas
│   │   ├── club/        # Paginas institucionales
│   │   ├── socios/      # Informacion socios
│   │   └── beneficios/  # Beneficios socios
│   ├── (auth)/          # Login, registro, recuperar
│   ├── admin/           # Panel de administracion
│   ├── mi-cuenta/       # Area privada del usuario
│   └── api/             # API Routes
├── components/
│   ├── ui/              # Componentes reutilizables (Button, Card, Modal, Input, Toast)
│   ├── layout/          # Header, Footer, PageHeader
│   ├── tienda/          # Componentes de tienda
│   ├── eventos/         # Componentes de eventos
│   └── admin/           # Componentes del admin
├── lib/
│   ├── supabase/        # Clientes Supabase (client, server, middleware)
│   ├── utils.ts         # Utilidades (cn, formatPrice, formatDate)
│   ├── tienda.ts        # Funciones de tienda
│   ├── eventos.ts       # Funciones de eventos
│   ├── mercadopago.ts   # Integracion MercadoPago
│   └── resend.ts        # Integracion emails
├── stores/              # Zustand stores (cartStore, ticketStore)
├── hooks/               # Custom hooks (useAuth, useScrollReveal)
├── types/               # Tipos TypeScript
├── data/                # Datos estaticos (deportes, directivos, memorias)
└── contexts/            # React contexts
```

## Convenciones de Codigo

### Imports
- Usar alias `@/` para imports desde `src/`
- Los componentes se exportan desde archivos `index.ts` en cada carpeta

### Componentes
- Componentes cliente: agregar `"use client"` al inicio
- Props con interfaces nombradas (ej: `PageHeaderProps`)
- Usar `cn()` de `@/lib/utils` para combinar clases Tailwind

### Estilos
- Tailwind CSS para todos los estilos
- No usar CSS modules ni styled-components
- Colores personalizados definidos en `tailwind.config.ts`

### Estado
- Zustand para estado global (carrito, tickets)
- TanStack Query para datos del servidor
- useState/useReducer para estado local

## Sistema de Diseno

### Colores
```
bordo:    #730d32 (principal)
bordo-dark:  #5a0a28
bordo-light: #8c103d

amarillo: #f7b643 (acento)
amarillo-dark:  #e5a331
amarillo-light: #f9c76a
```

### Fuente
- Poppins (sans-serif) como fuente principal

### Componentes UI
Importar desde `@/components/ui`:
- `Button` - Botones con variantes (primary, secondary, outline, ghost)
- `Card` - Tarjetas contenedoras
- `Modal` - Modales/dialogs
- `Input` - Campos de formulario
- `Toast` - Notificaciones

## Comandos Utiles

```bash
npm run dev      # Desarrollo (Turbopack)
npm run build    # Build produccion
npm run lint     # ESLint
npm run test     # Tests Playwright
npm run test:ui  # Tests con UI
```

## Base de Datos (Supabase)

### Clientes
- `createClient()` de `@/lib/supabase/client` - Para componentes cliente
- `createClient()` de `@/lib/supabase/server` - Para Server Components y API Routes

### Autenticacion
- Usar `useAuth()` hook para obtener usuario actual
- Middleware protege rutas `/admin` y `/mi-cuenta`

## Patrones Comunes

### Pagina con contenido dinamico
```tsx
// page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData();
  return <PageContent data={data} />;
}

// PageContent.tsx (Client Component)
"use client";
export function PageContent({ data }) {
  // Logica interactiva
}
```

### API Route
```tsx
// route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tabla").select();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
```

### Formateo
```tsx
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";

formatPrice(1500);      // "$U 1.500,00"
formatDate(new Date()); // "28 de enero de 2026"
```

## Variables de Entorno

Requeridas en `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `RESEND_API_KEY`
- `SENTRY_DSN`
