-- ============================================================
-- SETUP FINAL — Casos Críticos Travelkit
-- Hace TODO lo pendiente de una sola vez. Es idempotente:
-- puedes ejecutarlo varias veces sin romper nada.
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── 1. Limpieza del modelo ──────────────────────────────────
-- Quitar la columna 'origen' (canal) que ya no se usa
ALTER TABLE public.casos DROP COLUMN IF EXISTS origen;

-- Asegurar columna de documentos (por si faltara)
ALTER TABLE public.casos ADD COLUMN IF NOT EXISTS documentos jsonb DEFAULT '[]'::jsonb;

-- ── 2. Migración de estatus al conjunto nuevo ───────────────
--    Abierto · En seguimiento · Respuesta Proveedor · Resuelto
UPDATE public.casos SET estatus = 'En seguimiento' WHERE estatus = 'Reembolso | Pendiente';
UPDATE public.casos SET estatus = 'Resuelto'       WHERE estatus = 'Cerrado';

-- ── 3. Tabla de recordatorios (tareas) ──────────────────────
CREATE TABLE IF NOT EXISTS public.casos_tareas (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id         uuid        NOT NULL REFERENCES public.casos(id) ON DELETE CASCADE,
  texto             text        NOT NULL,
  responsable       text        DEFAULT '',
  fecha_limite      timestamptz NOT NULL,
  depende_proveedor boolean     DEFAULT false,
  completada        boolean     DEFAULT false,
  notificar         boolean     DEFAULT true,
  notificado        boolean     DEFAULT false,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tareas_ticket ON public.casos_tareas (ticket_id);
CREATE INDEX IF NOT EXISTS idx_tareas_pend   ON public.casos_tareas (completada, notificar, notificado, fecha_limite);

ALTER TABLE public.casos_tareas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tareas lectura"       ON public.casos_tareas;
DROP POLICY IF EXISTS "tareas insercion"     ON public.casos_tareas;
DROP POLICY IF EXISTS "tareas actualizacion" ON public.casos_tareas;

CREATE POLICY "tareas lectura"       ON public.casos_tareas FOR SELECT TO authenticated USING (true);
CREATE POLICY "tareas insercion"     ON public.casos_tareas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tareas actualizacion" ON public.casos_tareas FOR UPDATE TO authenticated USING (true);

-- ── 4. Storage: bucket de documentos ────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('casos-docs', 'casos-docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "casos-docs lectura" ON storage.objects;
DROP POLICY IF EXISTS "casos-docs subida"  ON storage.objects;
DROP POLICY IF EXISTS "casos-docs borrado" ON storage.objects;

CREATE POLICY "casos-docs lectura" ON storage.objects
  FOR SELECT USING (bucket_id = 'casos-docs');
CREATE POLICY "casos-docs subida" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'casos-docs');
CREATE POLICY "casos-docs borrado" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'casos-docs');

-- ============================================================
-- LISTO. Refresca /casos en la app.
--
-- Si el bloque 4 (bucket) diera error de permisos, crea el
-- bucket a mano: Storage → New bucket → nombre "casos-docs" →
-- Public → Create, y vuelve a correr solo el bloque 4.
-- ============================================================
