-- ============================================================
-- MIGRACIÓN: casos_criticos.tickets → modelo Asistencia (WTA)
-- Añade los campos del listado de asistencia (voucher, paciente,
-- pasaporte, síntoma, tipo de asistencia, países, fechas) sobre la
-- tabla existente. Es ADITIVA: no borra columnas previas.
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Nuevas columnas del caso de asistencia
ALTER TABLE casos_criticos.tickets
  ADD COLUMN IF NOT EXISTS numero_caso      text,
  ADD COLUMN IF NOT EXISTS compania         text,
  ADD COLUMN IF NOT EXISTS voucher          text,
  ADD COLUMN IF NOT EXISTS nombre_paciente  text,
  ADD COLUMN IF NOT EXISTS pasaporte        text,
  ADD COLUMN IF NOT EXISTS fecha_nacimiento date,
  ADD COLUMN IF NOT EXISTS origen           text,   -- canal: Teléfono | Whatsapp | Chat | Email
  ADD COLUMN IF NOT EXISTS sintoma          text,
  ADD COLUMN IF NOT EXISTS tipo_asistencia  text,   -- Médico | Dental | Soporte E-sim | …
  ADD COLUMN IF NOT EXISTS estatus          text,   -- Abierto | En seguimiento | Reembolso | Pendiente | Resuelto | Cerrado
  ADD COLUMN IF NOT EXISTS fecha_evento     timestamptz,
  ADD COLUMN IF NOT EXISTS fecha_apertura   date DEFAULT now(),
  ADD COLUMN IF NOT EXISTS origen_viaje     text,   -- ISO-2 país (CO, EC, MX…)
  ADD COLUMN IF NOT EXISTS pais_servicio    text;   -- ISO-2 país

-- 2. Índice para búsquedas rápidas por número de caso y voucher
CREATE INDEX IF NOT EXISTS idx_casos_numero  ON casos_criticos.tickets (numero_caso);
CREATE INDEX IF NOT EXISTS idx_casos_voucher ON casos_criticos.tickets (voucher);

-- 3. Tabla de seguimiento (timeline de notas por caso)
CREATE TABLE IF NOT EXISTS casos_criticos.seguimiento (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id  uuid        NOT NULL REFERENCES casos_criticos.tickets(id) ON DELETE CASCADE,
  autor      text        NOT NULL,
  texto      text        NOT NULL,
  timestamp  timestamptz DEFAULT now() NOT NULL
);

GRANT ALL ON casos_criticos.seguimiento TO anon, authenticated, service_role;
ALTER TABLE casos_criticos.seguimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seguimiento lectura"   ON casos_criticos.seguimiento FOR SELECT TO authenticated USING (true);
CREATE POLICY "seguimiento insercion" ON casos_criticos.seguimiento FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- NOTA: el CHECK de estatus heredado de la tabla original
-- (Abierto | En gestion del proveedor | Información cliente | Finalizado)
-- aplica a la columna `estado`. El nuevo flujo usa la columna `estatus`
-- (sin CHECK) para no romper datos existentes. Si quieres forzar valores:
--
-- ALTER TABLE casos_criticos.tickets
--   ADD CONSTRAINT chk_estatus CHECK (estatus IN
--     ('Abierto','En seguimiento','Reembolso | Pendiente','Resuelto','Cerrado'));
-- ============================================================
