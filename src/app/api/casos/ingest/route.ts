import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Alta automática de casos de REEMBOLSO desde correo (Power Automate).
 *
 * El flujo de Power Automate hace POST con { subject: "<asunto del correo>" }.
 * Asunto esperado:
 *   Documento de tipo Reembolso | 1655346-02 [ALFONSO MARIA MARTINEZ RESTREPO] | GB-80G6M
 *
 * Seguridad: header  x-ingest-secret === INGEST_SECRET (o CRON_SECRET).
 *
 * Variables de entorno: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *                       INGEST_SECRET (o CRON_SECRET).
 */
export async function POST(request: Request) {
  const secret = process.env.INGEST_SECRET ?? process.env.CRON_SECRET;
  if (secret && request.headers.get('x-ingest-secret') !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return NextResponse.json({ error: 'Faltan credenciales de Supabase' }, { status: 500 });

  let subject = '';
  try {
    const body = await request.json();
    subject = (body.subject ?? body.asunto ?? '').toString().trim();
  } catch {
    return NextResponse.json({ error: 'Body inválido (se espera JSON con "subject")' }, { status: 400 });
  }
  if (!subject) return NextResponse.json({ error: 'Falta el asunto' }, { status: 400 });

  // Solo procesar correos de reembolso
  if (!/reembolso/i.test(subject)) {
    return NextResponse.json({ ignorado: true, motivo: 'El asunto no es de reembolso' });
  }

  // Parseo:  ... | <numero_caso> [<paciente>] | <voucher>
  const m = subject.match(/\|\s*([^[\]|]+?)\s*\[([^\]]+)\]\s*\|\s*([^\s|]+)/);
  if (!m) {
    return NextResponse.json({ error: 'No se pudo interpretar el asunto', subject }, { status: 422 });
  }
  const numero_caso     = m[1].trim();
  const nombre_paciente = m[2].trim();
  const voucher         = m[3].trim();

  const sb = createClient(url, service);

  // Evitar duplicados: si ya existe un caso con ese número, no crear otro
  const { data: existente } = await sb.from('casos').select('id').eq('numero_caso', numero_caso).maybeSingle();
  if (existente) {
    return NextResponse.json({ creado: false, duplicado: true, numero_caso, id: existente.id });
  }

  const { data, error } = await sb.from('casos').insert({
    numero_caso,
    nombre_paciente,
    voucher,
    proveedor: 'WTA',
    area:      'Reembolsos',
    estatus:   'Abierto',
    fecha_evento:   new Date().toISOString(),
    fecha_apertura: new Date().toISOString().slice(0, 10),
    descripcion: 'Caso de reembolso creado automáticamente desde correo (asistencia@travelkit.us).',
    creado_por:  'asistencia@travelkit.us',
  }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ creado: true, numero_caso, nombre_paciente, voucher, id: data.id });
}
