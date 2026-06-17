-- ============================================================
-- STORAGE — bucket "casos-docs" (solo esto)
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- Es idempotente: se puede correr varias veces sin error.
-- ============================================================

-- 1. Crear el bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('casos-docs', 'casos-docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Políticas de acceso
DROP POLICY IF EXISTS "casos-docs lectura" ON storage.objects;
DROP POLICY IF EXISTS "casos-docs subida"  ON storage.objects;
DROP POLICY IF EXISTS "casos-docs borrado" ON storage.objects;

CREATE POLICY "casos-docs lectura" ON storage.objects
  FOR SELECT USING (bucket_id = 'casos-docs');

CREATE POLICY "casos-docs subida" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'casos-docs');

CREATE POLICY "casos-docs borrado" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'casos-docs');
