-- ============================================================
-- Migración de estatus al nuevo conjunto:
--   Abierto · En seguimiento · Respuesta Proveedor · Resuelto
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- "Cerrado" deja de existir → pasa a "Resuelto"
UPDATE public.casos SET estatus = 'Resuelto' WHERE estatus = 'Cerrado';

-- (si quedó algún "Reembolso | Pendiente" de antes)
UPDATE public.casos SET estatus = 'En seguimiento' WHERE estatus = 'Reembolso | Pendiente';
