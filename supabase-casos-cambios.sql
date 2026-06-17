-- ============================================================
-- CAMBIOS — Proveedor / Área / Documentos
-- Aplica sobre la tabla public.casos ya existente.
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Renombrar columnas (compania → proveedor, cliente → area)
ALTER TABLE public.casos RENAME COLUMN compania TO proveedor;
ALTER TABLE public.casos RENAME COLUMN cliente  TO area;

-- 2. Quitar campos que ya no se usan
ALTER TABLE public.casos DROP COLUMN IF EXISTS sintoma;
ALTER TABLE public.casos DROP COLUMN IF EXISTS tipo_asistencia;

-- 3. Nuevos valores por defecto
ALTER TABLE public.casos ALTER COLUMN proveedor SET DEFAULT 'WTA';
ALTER TABLE public.casos ALTER COLUMN area      SET DEFAULT 'System';

-- 4. Columna de documentos adjuntos (jsonb: [{nombre,url,path}])
ALTER TABLE public.casos ADD COLUMN IF NOT EXISTS documentos jsonb DEFAULT '[]'::jsonb;

-- ============================================================
-- 5. STORAGE — bucket público "casos-docs"
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('casos-docs', 'casos-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage (lectura pública + subida/borrado para autenticados)
DROP POLICY IF EXISTS "casos-docs lectura"  ON storage.objects;
DROP POLICY IF EXISTS "casos-docs subida"   ON storage.objects;
DROP POLICY IF EXISTS "casos-docs borrado"  ON storage.objects;

CREATE POLICY "casos-docs lectura" ON storage.objects
  FOR SELECT USING (bucket_id = 'casos-docs');

CREATE POLICY "casos-docs subida" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'casos-docs');

CREATE POLICY "casos-docs borrado" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'casos-docs');

-- ============================================================
-- NOTA: si las columnas ya tenían los nombres nuevos (porque
-- recreaste la tabla), los pasos 1 fallarán con "column does not
-- exist" — es inofensivo, ignóralo y continúa con el resto.
-- ============================================================
