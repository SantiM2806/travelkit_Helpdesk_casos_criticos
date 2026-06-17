-- ============================================================
-- TAREAS + limpieza del modelo
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Quitar la columna 'origen' (canal) que ya no se usa
ALTER TABLE public.casos DROP COLUMN IF EXISTS origen;

-- 2. Migrar estatus viejo "Reembolso | Pendiente" → "En seguimiento"
UPDATE public.casos SET estatus = 'En seguimiento' WHERE estatus = 'Reembolso | Pendiente';

-- 3. Tabla de tareas accionables (distinta al seguimiento)
CREATE TABLE IF NOT EXISTS public.casos_tareas (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id         uuid        NOT NULL REFERENCES public.casos(id) ON DELETE CASCADE,
  texto             text        NOT NULL,
  responsable       text        DEFAULT '',
  fecha_limite      timestamptz NOT NULL,
  depende_proveedor boolean     DEFAULT false,
  completada        boolean     DEFAULT false,
  notificar         boolean     DEFAULT true,   -- enviar recordatorio por correo
  notificado        boolean     DEFAULT false,  -- ya se envió
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tareas_ticket   ON public.casos_tareas (ticket_id);
CREATE INDEX IF NOT EXISTS idx_tareas_pend     ON public.casos_tareas (completada, notificar, notificado, fecha_limite);

-- 4. RLS
ALTER TABLE public.casos_tareas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tareas lectura"      ON public.casos_tareas;
DROP POLICY IF EXISTS "tareas insercion"    ON public.casos_tareas;
DROP POLICY IF EXISTS "tareas actualizacion" ON public.casos_tareas;

CREATE POLICY "tareas lectura"       ON public.casos_tareas FOR SELECT TO authenticated USING (true);
CREATE POLICY "tareas insercion"     ON public.casos_tareas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tareas actualizacion" ON public.casos_tareas FOR UPDATE TO authenticated USING (true);
