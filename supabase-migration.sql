-- ============================================================
-- SCHEMA: casos_criticos
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- No toca el schema "public" del Helpdesk IT
-- ============================================================

-- 1. Crear schema
CREATE SCHEMA IF NOT EXISTS casos_criticos;

-- 2. Exponer a PostgREST (necesario para que la API lo reconozca)
GRANT USAGE ON SCHEMA casos_criticos TO anon, authenticated, service_role;

-- 3. Tabla principal de casos
CREATE TABLE casos_criticos.tickets (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id       text        UNIQUE,                        -- TKCC-0001, TKCC-0002…
  timestamp       timestamptz DEFAULT now() NOT NULL,
  cliente         text        NOT NULL,                      -- Nombre del cliente
  agencia         text        NOT NULL,                      -- Nombre de la agencia
  tipo_solicitud  text        NOT NULL CHECK (tipo_solicitud IN (
                                'Comercial', 'Sistem', 'Claims',
                                'Gestion de planes', 'Calidad'
                              )),
  prioridad       text        NOT NULL CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
  estado          text        NOT NULL DEFAULT 'Abierto'     CHECK (estado IN (
                                'Abierto',
                                'En gestion del proveedor',
                                'Información cliente',
                                'Finalizado'
                              )),
  responsable     text,
  descripcion     text        DEFAULT '',
  email           text                                       -- usuario que registró el caso
);

-- 4. Permisos sobre la tabla
GRANT ALL ON casos_criticos.tickets TO anon, authenticated, service_role;

-- 5. Row Level Security
ALTER TABLE casos_criticos.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura autenticados"
  ON casos_criticos.tickets FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Inserción autenticados"
  ON casos_criticos.tickets FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Actualización autenticados"
  ON casos_criticos.tickets FOR UPDATE
  TO authenticated USING (true);

-- ============================================================
-- PASO MANUAL REQUERIDO en Supabase Dashboard:
--   Settings → API → "Exposed schemas"
--   Agregar: casos_criticos
--   Guardar y recargar la API
-- ============================================================
