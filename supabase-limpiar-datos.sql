-- ============================================================
-- LIMPIAR DATOS DE PRUEBA
-- Borra TODOS los casos y, en cascada, su seguimiento y recordatorios.
-- Deja la estructura (tablas, políticas, bucket) intacta.
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ⚠️ Es destructivo: borra todos los registros de casos.
-- ============================================================

-- Borra casos → seguimiento y tareas se borran solos (ON DELETE CASCADE)
TRUNCATE public.casos CASCADE;

-- (Opcional) borrar también los archivos subidos al bucket:
--   Storage → casos-docs → seleccionar y eliminar manualmente,
--   o ejecutar:
-- DELETE FROM storage.objects WHERE bucket_id = 'casos-docs';
