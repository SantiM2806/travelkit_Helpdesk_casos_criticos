import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

/**
 * Recordatorios de tareas vencidas por correo (Office365).
 * Pensado para ser llamado por un cron (pg_cron de Supabase).
 * Protegido con el header `x-cron-secret` === process.env.CRON_SECRET.
 *
 * Variables de entorno necesarias:
 *   SUPABASE_SERVICE_ROLE_KEY   (clave service_role — solo servidor)
 *   RESEND_API_KEY              (envío de correo)
 *   CASOS_NOTIFY_EMAIL          (buzón operativo que recibe los avisos)
 *   CRON_SECRET                 (secreto compartido con el cron)
 *   CASOS_FROM_EMAIL            (opcional, remitente verificado en Resend)
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const notify  = process.env.CASOS_NOTIFY_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!url || !service) return NextResponse.json({ error: 'Faltan credenciales de Supabase' }, { status: 500 });
  if (!resendKey || !notify) return NextResponse.json({ error: 'Falta RESEND_API_KEY o CASOS_NOTIFY_EMAIL' }, { status: 500 });

  const sb = createClient(url, service);
  const ahora = new Date().toISOString();

  // Tareas vencidas, no completadas, con recordatorio activo y aún no notificadas
  const { data: tareas, error } = await sb
    .from('casos_tareas')
    .select('id, texto, responsable, fecha_limite, depende_proveedor, ticket_id, casos(numero_caso, nombre_paciente, proveedor)')
    .eq('completada', false)
    .eq('notificar', true)
    .eq('notificado', false)
    .lte('fecha_limite', ahora);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!tareas || tareas.length === 0) return NextResponse.json({ enviados: 0, mensaje: 'Sin tareas pendientes' });

  const resend = new Resend(resendKey);
  const from = process.env.CASOS_FROM_EMAIL ?? 'Casos Críticos Travelkit <casos@travelkit.us>';
  let enviados = 0;

  for (const t of tareas as unknown as Array<{
    id: string; texto: string; responsable: string; fecha_limite: string; depende_proveedor: boolean;
    casos: { numero_caso: string; nombre_paciente: string; proveedor: string } | null;
  }>) {
    const caso = t.casos;
    const tipo = t.depende_proveedor
      ? 'Verificar respuesta del proveedor (se comprometió para esta fecha).'
      : 'Tarea pendiente de ejecutar.';
    try {
      await resend.emails.send({
        from, to: notify,
        subject: `⏰ Recordatorio · Caso ${caso?.numero_caso ?? ''} — ${t.texto}`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto">
            <h2 style="color:#E30613;margin:0 0 8px">Recordatorio de tarea</h2>
            <p style="margin:0 0 16px;color:#444">${tipo}</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#888">Caso</td><td><b>${caso?.numero_caso ?? '—'}</b></td></tr>
              <tr><td style="padding:6px 0;color:#888">Paciente</td><td>${caso?.nombre_paciente ?? '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Proveedor</td><td>${caso?.proveedor ?? '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Tarea</td><td>${t.texto}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Responsable</td><td>${t.responsable || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888">Vence</td><td>${new Date(t.fecha_limite).toLocaleString('es-CO')}</td></tr>
            </table>
          </div>`,
      });
      await sb.from('casos_tareas').update({ notificado: true }).eq('id', t.id);
      enviados++;
    } catch (err) {
      console.error('[RECORDATORIOS] Error enviando tarea', t.id, err);
    }
  }

  return NextResponse.json({ enviados, total: tareas.length });
}
