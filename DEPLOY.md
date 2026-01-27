# Guía de Deploy - Club Seminario

## 1. Vercel

### Conectar Repositorio

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión
2. Clic en "Add New" → "Project"
3. Importar el repositorio de GitHub/GitLab
4. Framework preset: **Next.js** (detectado automáticamente)
5. Build Command: `npm run build`
6. Output Directory: `.next`

### Variables de Entorno

Configurar en Vercel → Project Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=[access-token-produccion]
MERCADOPAGO_PUBLIC_KEY=[public-key-produccion]

# Resend
RESEND_API_KEY=[api-key]
RESEND_FROM_EMAIL=Club Seminario <noreply@clubseminario.com.uy>

# Cron Jobs
CRON_SECRET=[generar-string-aleatorio-32-chars]

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://[key]@o[org-id].ingest.sentry.io/[project-id]
SENTRY_ORG=[org-slug]
SENTRY_PROJECT=[project-slug]
SENTRY_AUTH_TOKEN=[auth-token]

# App
NEXT_PUBLIC_URL=https://clubseminario.com.uy
NEXT_PUBLIC_SITE_NAME=Club Seminario
NEXT_PUBLIC_GA_ID=G-6VDYJBFESE
```

### Cron Jobs

El archivo `vercel.json` ya incluye el cron para recordatorios de eventos:
- **Ruta:** `/api/emails/recordatorio-eventos`
- **Horario:** Todos los días a las 10:00 UTC

Para verificar que funciona, revisar en Vercel → Project → Settings → Crons.

---

## 2. Supabase Producción

### Crear Proyecto de Producción

1. Ir a [supabase.com](https://supabase.com) → New Project
2. Seleccionar **Plan Pro** para backups automáticos
3. Elegir región: **South America (São Paulo)** para menor latencia
4. Guardar la contraseña de la base de datos

### Migrar Base de Datos

Opción A - Desde CLI:
```bash
# Instalar Supabase CLI si no está instalado
npm install -g supabase

# Linkear proyecto de producción
supabase link --project-ref [project-ref]

# Ejecutar migraciones
supabase db push
```

Opción B - Manual:
1. Ir a SQL Editor en el dashboard de Supabase
2. Ejecutar `supabase/migrations/001_initial_schema.sql`
3. Ejecutar `supabase/migrations/002_functions_triggers.sql`

### Configurar Backups (Plan Pro)

En Supabase Dashboard → Project Settings → Database:

- **Point-in-time Recovery:** Habilitado automáticamente en Pro
- **Daily Backups:** Retención de 7 días
- **PITR Window:** 7 días

Para restaurar un backup:
1. Ir a Database → Backups
2. Seleccionar fecha/hora
3. Clic en "Restore"

### Configurar Storage

1. Ir a Storage → Create a new bucket
2. Crear bucket `productos` (público)
3. Crear bucket `eventos` (público)
4. Crear bucket `memorias` (público)

Políticas RLS para buckets públicos:
```sql
-- Permitir lectura pública
CREATE POLICY "Lectura pública" ON storage.objects
FOR SELECT USING (bucket_id IN ('productos', 'eventos', 'memorias'));

-- Solo admins pueden subir/editar
CREATE POLICY "Admins pueden modificar" ON storage.objects
FOR ALL USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
```

### Configurar Auth

En Authentication → URL Configuration:
- **Site URL:** `https://clubseminario.com.uy`
- **Redirect URLs:**
  - `https://clubseminario.com.uy/**`
  - `http://localhost:3000/**` (para desarrollo)

En Authentication → Email Templates, personalizar emails en español.

---

## 3. Dominio y SSL

### Configurar Dominio en Vercel

1. Ir a Vercel → Project → Settings → Domains
2. Agregar `clubseminario.com.uy`
3. Vercel mostrará los DNS records necesarios

### Configurar DNS

En el registrador de dominio (o Cloudflare), agregar:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

O usando los nameservers de Vercel (recomendado):
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

### SSL

Vercel provisiona certificados SSL automáticamente:
- Certificado gratuito de Let's Encrypt
- Renovación automática
- HTTP/2 habilitado

Verificar en Settings → Domains que aparezca "Valid Configuration" con candado verde.

---

## 4. Sentry

### Crear Proyecto en Sentry

1. Ir a [sentry.io](https://sentry.io) → Create Project
2. Seleccionar **Next.js**
3. Copiar el DSN

### Obtener Tokens

En Sentry → Settings → Developer Settings → Auth Tokens:
1. Crear nuevo token con permisos: `project:releases`, `org:read`
2. Copiar el token para `SENTRY_AUTH_TOKEN`

### Verificar Integración

Después del deploy, ir a Sentry → Issues para ver errores capturados.

Para probar manualmente:
```javascript
// En cualquier componente cliente
import * as Sentry from "@sentry/nextjs";
Sentry.captureMessage("Test desde producción");
```

---

## 5. MercadoPago Producción

### Obtener Credenciales de Producción

1. Ir a [mercadopago.com.uy/developers](https://www.mercadopago.com.uy/developers)
2. En Credenciales → Producción
3. Copiar Access Token y Public Key

### Configurar Webhooks

En MercadoPago → Desarrolladores → Webhooks:
- **URL:** `https://clubseminario.com.uy/api/mercadopago/webhook`
- **Eventos:** `payment`, `merchant_order`

---

## 6. Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos migrada en Supabase producción
- [ ] Buckets de Storage creados con políticas RLS
- [ ] Dominio configurado y SSL activo
- [ ] Sentry proyecto creado y DSN configurado
- [ ] MercadoPago credenciales de producción
- [ ] Webhooks de MercadoPago apuntando a producción
- [ ] URLs de redirección configuradas en Supabase Auth
- [ ] Email templates personalizados en Supabase

## 7. Checklist Post-Deploy

- [ ] Verificar home carga correctamente
- [ ] Probar flujo de registro/login
- [ ] Probar compra de prueba en tienda
- [ ] Verificar emails transaccionales llegan
- [ ] Verificar errores se reportan a Sentry
- [ ] Correr Lighthouse y verificar score > 90
- [ ] Verificar cron job de recordatorios en Vercel

---

## Comandos Útiles

```bash
# Ver logs de Vercel
vercel logs

# Re-deploy forzando rebuild
vercel --force

# Ver estado del proyecto
vercel inspect

# Promover preview a producción
vercel promote [deployment-url]
```

## Rollback

Si algo sale mal después del deploy:

1. En Vercel → Deployments
2. Encontrar el deployment anterior funcionando
3. Clic en los tres puntos → "Promote to Production"

El rollback es instantáneo ya que Vercel mantiene los builds anteriores.
