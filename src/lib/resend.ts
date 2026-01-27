import { Resend } from "resend";

// Lazy initialization to avoid build-time errors when API key is not set
let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Default from email - should be verified domain in Resend
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Club Seminario <noreply@clubseminario.com.uy>";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Club Seminario";
const SITE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// Common email styles
export const emailStyles = {
  container: `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  `,
  header: `
    background-color: #730d32;
    padding: 24px;
    text-align: center;
  `,
  logo: `
    width: 80px;
    height: auto;
  `,
  content: `
    padding: 32px 24px;
  `,
  title: `
    color: #730d32;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 16px 0;
  `,
  text: `
    color: #333333;
    font-size: 16px;
    line-height: 1.6;
    margin: 0 0 16px 0;
  `,
  button: `
    display: inline-block;
    background-color: #730d32;
    color: #ffffff;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 16px 0;
  `,
  buttonSecondary: `
    display: inline-block;
    background-color: #f7b643;
    color: #730d32;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 16px 0;
  `,
  divider: `
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 24px 0;
  `,
  itemRow: `
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  `,
  totalRow: `
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    font-weight: 600;
    font-size: 18px;
    color: #730d32;
  `,
  footer: `
    background-color: #f5f5f5;
    padding: 24px;
    text-align: center;
    color: #666666;
    font-size: 14px;
  `,
  qrContainer: `
    text-align: center;
    padding: 24px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 16px 0;
  `,
  ticketCard: `
    border: 2px solid #730d32;
    border-radius: 12px;
    padding: 20px;
    margin: 16px 0;
    background-color: #fafafa;
  `,
};

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-UY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

// Format time
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}

// Email base template
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${SITE_NAME}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f0f0;">
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <img
            src="${SITE_URL}/logo-cs.png"
            alt="${SITE_NAME}"
            style="${emailStyles.logo}"
          />
        </div>
        ${content}
        <div style="${emailStyles.footer}">
          <p style="margin: 0 0 8px 0;">
            <strong>${SITE_NAME}</strong>
          </p>
          <p style="margin: 0 0 8px 0;">
            Soriano 1472, Colegio Seminario
          </p>
          <p style="margin: 0;">
            <a href="mailto:secretaria@clubseminario.com.uy" style="color: #730d32;">
              secretaria@clubseminario.com.uy
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Types
export interface OrderItem {
  nombre: string;
  cantidad: number;
  precio: number;
  talla?: string | null;
  color?: string | null;
}

export interface OrderEmailData {
  numeroPedido: string;
  nombreCliente: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  costoEnvio: number;
  descuento?: number;
  total: number;
  metodoEnvio?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
}

export interface TicketEmailData {
  nombreAsistente: string;
  email: string;
  evento: {
    titulo: string;
    fecha: string;
    hora?: string;
    ubicacion?: string;
    direccion?: string;
    slug: string;
  };
  entrada: {
    tipoNombre: string;
    codigoQR: string;
    qrImageUrl?: string;
  };
}

export interface EventReminderData {
  nombreAsistente: string;
  email: string;
  evento: {
    titulo: string;
    fecha: string;
    hora?: string;
    ubicacion?: string;
    direccion?: string;
    slug: string;
  };
  entradas: {
    tipoNombre: string;
    codigoQR: string;
    qrImageUrl?: string;
  }[];
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <strong>${item.nombre}</strong>
            ${item.talla ? `<br><small style="color: #666;">Talla: ${item.talla}</small>` : ""}
            ${item.color ? `<br><small style="color: #666;">Color: ${item.color}</small>` : ""}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: center;">
            ${item.cantidad}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
            ${formatCurrency(item.precio * item.cantidad)}
          </td>
        </tr>
      `
    )
    .join("");

  const content = `
    <div style="${emailStyles.content}">
      <h1 style="${emailStyles.title}">¡Gracias por tu compra!</h1>
      <p style="${emailStyles.text}">
        Hola <strong>${data.nombreCliente}</strong>,
      </p>
      <p style="${emailStyles.text}">
        Hemos recibido tu pedido <strong>#${data.numeroPedido}</strong> y está siendo procesado.
      </p>

      <hr style="${emailStyles.divider}" />

      <h2 style="color: #730d32; font-size: 18px; margin: 0 0 16px 0;">
        Detalle del pedido
      </h2>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #730d32;">Producto</th>
            <th style="text-align: center; padding: 8px 0; border-bottom: 2px solid #730d32;">Cant.</th>
            <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #730d32;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <table style="width: 100%; margin-top: 16px;">
        <tr>
          <td style="padding: 4px 0; color: #666;">Subtotal</td>
          <td style="padding: 4px 0; text-align: right;">${formatCurrency(data.subtotal)}</td>
        </tr>
        ${
          data.descuento
            ? `
          <tr>
            <td style="padding: 4px 0; color: #666;">Descuento</td>
            <td style="padding: 4px 0; text-align: right; color: #22c55e;">-${formatCurrency(data.descuento)}</td>
          </tr>
        `
            : ""
        }
        <tr>
          <td style="padding: 4px 0; color: #666;">Envío (${data.metodoEnvio || "Retiro en sede"})</td>
          <td style="padding: 4px 0; text-align: right;">${data.costoEnvio > 0 ? formatCurrency(data.costoEnvio) : "Gratis"}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-size: 18px; font-weight: 600; color: #730d32; border-top: 2px solid #730d32;">Total</td>
          <td style="padding: 12px 0; font-size: 18px; font-weight: 600; color: #730d32; text-align: right; border-top: 2px solid #730d32;">
            ${formatCurrency(data.total)}
          </td>
        </tr>
      </table>

      ${
        data.direccion
          ? `
        <hr style="${emailStyles.divider}" />
        <h2 style="color: #730d32; font-size: 18px; margin: 0 0 16px 0;">
          Dirección de envío
        </h2>
        <p style="${emailStyles.text}">
          ${data.direccion}<br>
          ${data.ciudad ? `${data.ciudad}, ` : ""}${data.departamento || ""}
        </p>
      `
          : `
        <hr style="${emailStyles.divider}" />
        <div style="background-color: #fef3cd; padding: 16px; border-radius: 8px;">
          <p style="margin: 0; color: #856404;">
            <strong>Retiro en sede:</strong> Tu pedido estará disponible para retirar en el Club Seminario.
            Te notificaremos cuando esté listo.
          </p>
        </div>
      `
      }

      <hr style="${emailStyles.divider}" />

      <p style="text-align: center;">
        <a href="${SITE_URL}/mi-cuenta/pedidos" style="${emailStyles.button}">
          Ver mis pedidos
        </a>
      </p>
    </div>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Confirmación de pedido #${data.numeroPedido} - ${SITE_NAME}`,
    html: baseTemplate(content),
  });
}

// Send ticket email with QR code
export async function sendTicketEmail(data: TicketEmailData) {
  const content = `
    <div style="${emailStyles.content}">
      <h1 style="${emailStyles.title}">¡Tu entrada está lista!</h1>
      <p style="${emailStyles.text}">
        Hola <strong>${data.nombreAsistente}</strong>,
      </p>
      <p style="${emailStyles.text}">
        Tu entrada para <strong>${data.evento.titulo}</strong> ha sido confirmada.
        Presentá este código QR en la entrada del evento.
      </p>

      <div style="${emailStyles.ticketCard}">
        <h2 style="color: #730d32; font-size: 20px; margin: 0 0 16px 0; text-align: center;">
          ${data.evento.titulo}
        </h2>

        <div style="${emailStyles.qrContainer}">
          ${
            data.entrada.qrImageUrl
              ? `<img src="${data.entrada.qrImageUrl}" alt="Código QR" style="width: 200px; height: 200px;" />`
              : `<div style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                   <span style="font-family: monospace; font-size: 12px;">${data.entrada.codigoQR}</span>
                 </div>`
          }
          <p style="margin: 16px 0 0 0; font-family: monospace; font-size: 14px; color: #666;">
            ${data.entrada.codigoQR}
          </p>
        </div>

        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Tipo de entrada</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">
              ${data.entrada.tipoNombre}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Fecha</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">
              ${formatDate(data.evento.fecha)}
            </td>
          </tr>
          ${
            data.evento.hora
              ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Hora</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">
                ${formatTime(data.evento.hora)}
              </td>
            </tr>
          `
              : ""
          }
          ${
            data.evento.ubicacion
              ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Lugar</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">
                ${data.evento.ubicacion}
              </td>
            </tr>
          `
              : ""
          }
        </table>
      </div>

      ${
        data.evento.direccion
          ? `
        <p style="${emailStyles.text}">
          <strong>Dirección:</strong> ${data.evento.direccion}
        </p>
      `
          : ""
      }

      <hr style="${emailStyles.divider}" />

      <p style="text-align: center;">
        <a href="${SITE_URL}/mi-cuenta/entradas" style="${emailStyles.button}">
          Ver mis entradas
        </a>
      </p>

      <p style="color: #666; font-size: 14px; text-align: center;">
        También podés acceder a tu entrada desde la app o la web en cualquier momento.
      </p>
    </div>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Tu entrada para ${data.evento.titulo} - ${SITE_NAME}`,
    html: baseTemplate(content),
  });
}

// Send event reminder email (24h before)
export async function sendEventReminderEmail(data: EventReminderData) {
  const entradasHtml = data.entradas
    .map(
      (entrada) => `
      <div style="${emailStyles.ticketCard}">
        <div style="${emailStyles.qrContainer}">
          ${
            entrada.qrImageUrl
              ? `<img src="${entrada.qrImageUrl}" alt="Código QR" style="width: 150px; height: 150px;" />`
              : `<div style="width: 150px; height: 150px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                   <span style="font-family: monospace; font-size: 10px;">${entrada.codigoQR}</span>
                 </div>`
          }
          <p style="margin: 8px 0 0 0; font-family: monospace; font-size: 12px; color: #666;">
            ${entrada.codigoQR}
          </p>
        </div>
        <p style="text-align: center; margin: 8px 0 0 0; color: #666;">
          ${entrada.tipoNombre}
        </p>
      </div>
    `
    )
    .join("");

  const content = `
    <div style="${emailStyles.content}">
      <div style="background-color: #f7b643; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: #730d32; font-size: 20px; margin: 0;">
          ¡Recordatorio! Tu evento es mañana
        </h1>
      </div>

      <p style="${emailStyles.text}">
        Hola <strong>${data.nombreAsistente}</strong>,
      </p>
      <p style="${emailStyles.text}">
        Te recordamos que mañana tenés entrada para <strong>${data.evento.titulo}</strong>.
      </p>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Fecha</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #730d32;">
              ${formatDate(data.evento.fecha)}
            </td>
          </tr>
          ${
            data.evento.hora
              ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Hora</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #730d32;">
                ${formatTime(data.evento.hora)}
              </td>
            </tr>
          `
              : ""
          }
          ${
            data.evento.ubicacion
              ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Lugar</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">
                ${data.evento.ubicacion}
              </td>
            </tr>
          `
              : ""
          }
          ${
            data.evento.direccion
              ? `
            <tr>
              <td style="padding: 8px 0; color: #666;">Dirección</td>
              <td style="padding: 8px 0; text-align: right;">
                ${data.evento.direccion}
              </td>
            </tr>
          `
              : ""
          }
        </table>
      </div>

      <h2 style="color: #730d32; font-size: 18px; margin: 24px 0 16px 0; text-align: center;">
        ${data.entradas.length > 1 ? "Tus entradas" : "Tu entrada"}
      </h2>

      ${entradasHtml}

      <hr style="${emailStyles.divider}" />

      <p style="text-align: center;">
        <a href="${SITE_URL}/mi-cuenta/entradas" style="${emailStyles.button}">
          Ver mis entradas
        </a>
      </p>

      <p style="color: #666; font-size: 14px; text-align: center;">
        No olvides llevar tu celular con el código QR para ingresar al evento.
      </p>
    </div>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `Recordatorio: ${data.evento.titulo} es mañana - ${SITE_NAME}`,
    html: baseTemplate(content),
  });
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const content = `
    <div style="${emailStyles.content}">
      <h1 style="${emailStyles.title}">Restablecer contraseña</h1>
      <p style="${emailStyles.text}">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
      </p>
      <p style="${emailStyles.text}">
        Si no solicitaste este cambio, podés ignorar este email.
      </p>

      <p style="text-align: center;">
        <a href="${resetLink}" style="${emailStyles.button}">
          Restablecer contraseña
        </a>
      </p>

      <p style="color: #666; font-size: 14px;">
        Este enlace expira en 1 hora por seguridad.
      </p>

      <hr style="${emailStyles.divider}" />

      <p style="color: #666; font-size: 14px;">
        Si el botón no funciona, copiá y pegá este enlace en tu navegador:
        <br>
        <a href="${resetLink}" style="color: #730d32; word-break: break-all;">
          ${resetLink}
        </a>
      </p>
    </div>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Restablecer contraseña - ${SITE_NAME}`,
    html: baseTemplate(content),
  });
}

// Export resend getter for custom use
export { getResend as resend };
