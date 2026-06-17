-- ============================================================
-- SETUP — Casos Críticos (Asistencia) en schema PUBLIC
-- Ejecutar TODO en: Supabase Dashboard → SQL Editor → Run
-- No requiere exponer schemas: public ya está expuesto.
-- ============================================================

-- 1. Tabla principal de casos
CREATE TABLE IF NOT EXISTS public.casos (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_caso       text        NOT NULL,
  proveedor         text        DEFAULT 'WTA',     -- WTA | WMC
  voucher           text,
  nombre_paciente   text        NOT NULL,
  pasaporte         text,
  fecha_nacimiento  date,
  origen            text,                          -- Teléfono | Whatsapp | Chat | Email
  area              text        DEFAULT 'System',  -- System | Claims | Calidad | Reembolsos | Comercial
  estatus           text        DEFAULT 'Abierto',
  fecha_evento      timestamptz DEFAULT now(),
  fecha_apertura    date        DEFAULT now(),
  origen_viaje      text,
  pais_servicio     text,
  descripcion       text        DEFAULT '',
  documentos        jsonb       DEFAULT '[]'::jsonb,
  creado_por        text,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_casos_numero  ON public.casos (numero_caso);
CREATE INDEX IF NOT EXISTS idx_casos_voucher ON public.casos (voucher);

-- 2. Timeline de seguimiento
CREATE TABLE IF NOT EXISTS public.casos_seguimiento (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id   uuid        NOT NULL REFERENCES public.casos(id) ON DELETE CASCADE,
  autor       text        NOT NULL,
  texto       text        NOT NULL,
  "timestamp" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_casos_seg_ticket ON public.casos_seguimiento (ticket_id);

-- 3. Row Level Security (lectura/escritura para usuarios autenticados)
ALTER TABLE public.casos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casos_seguimiento  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "casos lectura"        ON public.casos;
DROP POLICY IF EXISTS "casos insercion"      ON public.casos;
DROP POLICY IF EXISTS "casos actualizacion"  ON public.casos;
DROP POLICY IF EXISTS "seg lectura"          ON public.casos_seguimiento;
DROP POLICY IF EXISTS "seg insercion"        ON public.casos_seguimiento;

CREATE POLICY "casos lectura"       ON public.casos              FOR SELECT TO authenticated USING (true);
CREATE POLICY "casos insercion"     ON public.casos              FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "casos actualizacion" ON public.casos              FOR UPDATE TO authenticated USING (true);
CREATE POLICY "seg lectura"         ON public.casos_seguimiento  FOR SELECT TO authenticated USING (true);
CREATE POLICY "seg insercion"       ON public.casos_seguimiento  FOR INSERT TO authenticated WITH CHECK (true);

-- 4. STORAGE — bucket público para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('casos-docs', 'casos-docs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "casos-docs lectura" ON storage.objects;
DROP POLICY IF EXISTS "casos-docs subida"  ON storage.objects;
DROP POLICY IF EXISTS "casos-docs borrado" ON storage.objects;
CREATE POLICY "casos-docs lectura" ON storage.objects FOR SELECT USING (bucket_id = 'casos-docs');
CREATE POLICY "casos-docs subida"  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'casos-docs');
CREATE POLICY "casos-docs borrado" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'casos-docs');

-- 5. Datos de ejemplo (opcional — borra este bloque si no los quieres)
INSERT INTO public.casos
  (numero_caso, proveedor, voucher, nombre_paciente, pasaporte, fecha_nacimiento, origen, area, estatus, fecha_evento, fecha_apertura, origen_viaje, pais_servicio, descripcion)
VALUES
  ('1655479-01','WTA','TK-EHCLHE','Alex Amerito Zarate','EC8842013','1991-04-12','Teléfono','Claims','Abierto', now(), current_date,'EC','CO','Dolor dental agudo durante la estadía.'),
  ('1655457-01','WMC','TK-D07EFA','Gabriella Torralvo Moreno','CO1029384','1988-11-03','Whatsapp','Reembolsos','Reembolso | Pendiente', now(), current_date,'CO','DO','Reembolso por atención médica ambulatoria.'),
  ('1655448-01','WTA','8985234202245447223','Luisa Fernanda Rincon Arango','MX5567120','1995-07-22','Chat','System','En seguimiento', now(), current_date,'MX','MX','E-sim sin conectividad tras activación.');
