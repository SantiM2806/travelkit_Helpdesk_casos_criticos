import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const PRIORITY_COLOR: Record<string, string> = {
  Alta:  '#D32F2F',
  Media: '#F57C00',
  Baja:  '#388E3C',
};

export async function POST(request: Request) {
  const { email, full_name, ticket_id, urgency, subject } = await request.json();

  if (!email || !ticket_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const color = PRIORITY_COLOR[urgency] ?? '#555';

  const { error } = await resend.emails.send({
    from: 'Soporte IT Travelkit <it@travelkit.us>',
    to:   email,
    subject: `[${ticket_id}] Tu solicitud fue recibida`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ebebeb">

              <!-- Header rojo -->
              <tr><td style="background:#D32F2F;padding:28px 40px">
                <p style="margin:0;color:#fff;font-size:18px;font-weight:600">Soporte IT · Travelkit</p>
              </td></tr>

              <!-- Body -->
              <tr><td style="padding:36px 40px">
                <p style="margin:0 0 8px;color:#1a1a1a;font-size:16px;font-weight:600">Hola, ${full_name}</p>
                <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:1.6">
                  Tu solicitud fue registrada correctamente. El equipo de IT la revisará y te contactará a la brevedad.
                </p>

                <!-- Ticket card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #ebebeb;border-radius:12px;overflow:hidden">
                  <tr><td style="padding:20px 24px;border-bottom:1px solid #ebebeb">
                    <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.08em">Número de ticket</p>
                    <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#D32F2F;font-family:monospace;letter-spacing:.05em">${ticket_id}</p>
                  </td></tr>
                  <tr><td style="padding:20px 24px;border-bottom:1px solid #ebebeb">
                    <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.08em">Asunto</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-weight:500">${subject}</p>
                  </td></tr>
                  <tr><td style="padding:20px 24px">
                    <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.08em">Prioridad</p>
                    <p style="margin:4px 0 0">
                      <span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600;color:#fff;background:${color}">${urgency}</span>
                    </p>
                  </td></tr>
                </table>

                <p style="margin:28px 0 0;color:#888;font-size:13px;line-height:1.6">
                  Guarda este número para hacer seguimiento de tu caso. Si necesitas agregar información adicional, responde este correo.
                </p>
              </td></tr>

              <!-- Footer -->
              <tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;background:#fafafa">
                <p style="margin:0;color:#bbb;font-size:12px">Travelkit Colombia · Sistema interno de soporte IT</p>
              </td></tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
