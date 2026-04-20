# IT Helpdesk Travelkit

Sistema de gestión de tickets de soporte técnico IT para Travelkit Colombia.

## Descripción

Aplicación web para administrar y visualizar tickets de helpdesk interno. Permite gestionar solicitudes de soporte técnico de los empleados, con seguimiento de estado y Prior asignación de responsables.

## Funcionalidades

- **Dos vistas**: Tabla y Kanban
- **Filtros**: Estado, Prioridad, Búsqueda por texto
- **Tema**: Dark/Light con persistencia localStorage
- **Auto-refresh**: Configurable (60s por defecto)
- **Movimiento de tickets**: Modal con registro de acciones
- **Toasts**: Notificaciones animadas

## Stack Tecnológico

- Next.js 15.3.0
- React 19
- TypeScript
- Tailwind CSS 3.4
- Supabase (pendiente de configurar tablas)

## Estructura del Proyecto

```
app/
├── page.tsx          # Página principal
├── layout.tsx       # Layout raíz
└── globals.css      # Estilos globales

components/
├── Header.tsx          # Cabecera con logo, vista toggle, tema, sync
├── ConfigBanner.tsx    # Banner de configuración
├── StatsBar.tsx       # Estadísticas de tickets
├── FiltersRow.tsx     # Filtros de búsqueda
├── TicketTable.tsx      # Vista tabla
├── KanbanBoard.tsx     # Vista kanban
├── Modal.tsx           # Modal para mover tickets
└── ToastContainer.tsx # Notificaciones

lib/
├── types.ts        # TypeScript interfaces
├── data.ts        # Datos mock (18 tickets)
└── utils.ts       # Utilidades
```

## Estado Actual

- ✓ Proyecto funcional en modo demo (datos mock)
- ✓ SDK de Supabase instalado
- ✓ Credenciales configuradas en `.env`
- ✗ Tablas de Supabase pendientes de crear en el SQL Editor

## Configuración Supabase

### Vbles de entorno (.env)

```
NEXT_PUBLIC_SUPABASE_URL=https://rvqxqyzeqxyqrtlgphnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Tablas a crear (SQL Editor)

```sql
CREATE TABLE IF NOT EXISTS tickets (
  ticket_id text PRIMARY KEY,
  "timestamp" timestamptz NOT NULL,
  email text NOT NULL,
  categoria text NOT NULL,
  prioridad text NOT NULL,
  descripcion text NOT NULL,
  estado text NOT NULL DEFAULT 'Abierto',
  responsable text,
  area text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movement_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id text REFERENCES tickets(ticket_id),
  de text NOT NULL,
  a text NOT NULL,
  responsabilidad text NOT NULL,
  area text,
  accion text,
  moved_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso público tickets" ON tickets FOR ALL USING (true);
```

## Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Construir producción
npm run start  # Iniciar producción
```

## API Reference

### Tipos de Estado

- `Abierto` - Ticket nuevo sin asignar
- `En proceso` - Ticket asignado y en atención
- `Resuelto` - Ticket completado
- `Otra área` - Derivado a otra área

### Tipos de Prioridad

- `Alta` - Urgente
- `Media` - Normal
- `Baja` - Consulta

---

**Autor**: Travelkit IT Team
**Última actualización**: Abril 2026