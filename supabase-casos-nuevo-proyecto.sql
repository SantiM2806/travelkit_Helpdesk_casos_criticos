-- ============================================================
-- SETUP COMPLETO — Casos Críticos (Asistencia)
-- Para un proyecto Supabase NUEVO y limpio.
-- Ejecutar TODO en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Schema dedicado
CREATE SCHEMA IF NOT EXISTS casos_criticos;
GRANT USAGE ON SCHEMA casos_criticos TO anon, authenticated, service_role;

-- 2. Tabla principal de casos (modelo de asistencia)
CREATE TABLE IF NOT EXISTS casos_criticos.tickets (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_caso       text        NOT NULL,
  compania          text        DEFAULT 'TRAVELKIT',
  voucher           text,
  nombre_paciente   text        NOT NULL,
  pasaporte         text,
  fecha_nacimiento  date,
  origen            text,                          -- Teléfono | Whatsapp | Chat | Email
  sintoma           text        DEFAULT 'N/A',
  tipo_asistencia   text,                          -- Médico | Dental | Soporte E-sim | …
  estatus           text        DEFAULT 'Abierto', -- Abierto | En seguimiento | Reembolso | Pendiente | Resuelto | Cerrado
  fecha_evento      timestamptz DEFAULT now(),
  fecha_apertura    date        DEFAULT now(),
  origen_viaje      text,                          -- ISO-2 (CO, EC, MX…)
  pais_servicio     text,                          -- ISO-2
  cliente           text        DEFAULT 'TRAVELKIT',
  descripcion       text        DEFAULT '',
  creado_por        text,                          -- email del operativo
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_casos_numero  ON casos_criticos.tickets (numero_caso);
CREATE INDEX IF NOT EXISTS idx_casos_voucher ON casos_criticos.tickets (voucher);

-- 3. Timeline de seguimiento (notas por caso)
CREATE TABLE IF NOT EXISTS casos_criticos.seguimiento (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id  uuid        NOT NULL REFERENCES casos_criticos.tickets(id) ON DELETE CASCADE,
  autor      text        NOT NULL,
  texto      text        NOT NULL,
  "timestamp" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_seguimiento_ticket ON casos_criticos.seguimiento (ticket_id);

-- 4. Permisos
GRANT ALL ON casos_criticos.tickets     TO anon, authenticated, service_role;
GRANT ALL ON casos_criticos.seguimiento TO anon, authenticated, service_role;

-- 5. Row Level Security (lectura/escritura para usuarios autenticados)
ALTER TABLE casos_criticos.tickets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos_criticos.seguimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets lectura"        ON casos_criticos.tickets     FOR SELECT TO authenticated USING (true);
CREATE POLICY "tickets insercion"      ON casos_criticos.tickets     FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tickets actualizacion"  ON casos_criticos.tickets     FOR UPDATE TO authenticated USING (true);
CREATE POLICY "seguimiento lectura"    ON casos_criticos.seguimiento FOR SELECT TO authenticated USING (true);
CREATE POLICY "seguimiento insercion"  ON casos_criticos.seguimiento FOR INSERT TO authenticated WITH CHECK (true);

-- 6. Datos de ejemplo (opcional — borra este bloque si no los quieres)
INSERT INTO casos_criticos.tickets
  (numero_caso, compania, voucher, nombre_paciente, pasaporte, fecha_nacimiento, origen, sintoma, tipo_asistencia, estatus, fecha_evento, fecha_apertura, origen_viaje, pais_servicio, cliente, descripcion)
VALUES
  ('1655479-01','TRAVELKIT','TK-EHCLHE','Alex Amerito Zarate','EC8842013','1991-04-12','Teléfono','Dolor o malestar','Dental','Abierto', now(), current_date,'EC','CO','TRAVELKIT','Dolor dental agudo durante la estadía.'),
  ('1655457-01','TRAVELKIT','TK-D07EFA','Gabriella Torralvo Moreno','CO1029384','1988-11-03','Whatsapp','N/A','Médico','Reembolso | Pendiente', now(), current_date,'CO','DO','TRAVELKIT','Reembolso por atención médica ambulatoria.'),
  ('1655448-01','SIMCARD TRAVELKIT','8985234202245447223','Luisa Fernanda Rincon Arango','MX5567120','1995-07-22','Chat','N/A','Soporte E-sim','En seguimiento', now(), current_date,'MX','MX','SIMCARD','E-sim sin conectividad tras activación.');

-- ============================================================
-- PASO MANUAL FINAL (imprescindible):
--   Dashboard → Settings → API → "Exposed schemas"
--   Agregar:  casos_criticos
--   Guardar y recargar la API.
-- ============================================================
