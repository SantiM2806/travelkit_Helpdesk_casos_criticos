-- ============================================================
-- CRON de recordatorios — pg_cron + pg_net
-- Revisa cada 15 min las tareas vencidas y llama al endpoint
-- /api/recordatorios de la app, que envía el correo.
--
-- IMPORTANTE: pg_net necesita una URL pública (la app DESPLEGADA,
-- p. ej. en Vercel). En localhost no funciona porque Supabase no
-- alcanza tu máquina.
-- ============================================================

-- 1. Habilitar extensiones (Dashboard → Database → Extensions, o aquí)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Programar el job (cada 15 minutos)
--    Reemplaza:
--      https://TU-APP.vercel.app   → la URL pública de tu app
--      MI_SECRETO_CRON             → el mismo valor que CRON_SECRET en la app
SELECT cron.schedule(
  'recordatorios-casos',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://TU-APP.vercel.app/api/recordatorios',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'MI_SECRETO_CRON'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Para ver / borrar el job:
--   SELECT * FROM cron.job;
--   SELECT cron.unschedule('recordatorios-casos');
