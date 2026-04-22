# PROGRESS.md — IT Helpdesk · Travelkit Colombia

---

## Estado General

- El proyecto **Helpdesk-TravelKit** es una aplicación **Next.js 15** con autenticación Supabase, vistas tabla/kanban con drag&drop, y formulario público de solicitudes. La **base de datos Supabase ya está configurada** y conectada; las tablas `tickets`, `categorias_it` y `solicitudes_it` están creadas y operativas. El sistema se encuentra en **fase alfa avanzada**: todas las funcionalidades core están implementadas y funcionando, con deuda técnica menor concentrada en el dashboard ejecutivo (mock data) y la integración real-time de la tabla `movement_log`.

---

## Stack y Herramientas Confirmadas

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js | 15.3.0 |
| UI Library | React | 19.0.0 |
| Lenguaje | TypeScript | 5 |
| Estilos | Tailwind CSS | 3.4.17 |
| Base de datos | Supabase (PostgreSQL) | Proyecto `uprwmvrhgdqbylpxrcdq` |
| Auth | Supabase Auth SSR | 0.10.2 |
| Storage | Supabase Storage (bucket `ticket-attachments`) | — |
| Componentes UI | shadcn/ui + Radix UI | Radix 1.4.3 |
| Gráficos | Recharts | 3.8.0 |
| Iconos | Lucide React | 1.8.0 |
| Animaciones | tw-animate-css + keyframes personalizados | — |
| Clase util | class-variance-authority + clsx + tailwind-merge | — |
| Fonts | IBM Plex Sans + IBM Plex Mono + Geist | (Google Fonts) |

---

## Historial de Implementación (Paso a Paso)

### 1 · Scaffold y configuración inicial
- Se inicializó proyecto Next.js 15 con TypeScript (`npm create next-app`).
- Se configuró `tailwind.config.ts` con paleta de tokens CSS custom (`tk-bg`, `tk-accent`, `tk-red`, etc.) y familias tipográficas IBM Plex.
- Se integró shadcn/ui (`components.json` estilo `radix-nova`).
- Se configuró `.env` con credenciales Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### 2 · Diseño del sistema de diseño (Design System)
- Se definieron **variables CSS** para tema oscuro (default) y tema claro `[data-theme="light"]` con tokens semánticos (`--accent`, `--red`, `--green`, `--violet`, etc.).
- Se crearon **keyframes animados** en `globals.css`: `cardLand`, `toastIn/Out`, `fadeUp`, `fadeIn`, `shimmer`, `shimmerDrop`, `pulse-red`, `dot-bounce`.
- Se implementó **tema persistente** via `localStorage` con script inline en `<head>` (previene flash en primer paint).
- Se configuró fuente IBM Plex Sans/Mono como default via `next/font/google` en `layout.tsx`.

### 3 · Middleware de autenticación (Supabase SSR)
- Se creó `middleware.ts` con `createServerClient` de `@supabase/ssr`.
- Rutas protegidas: todas excepto `/solicitud` y `/login`.
- Redirecciones automáticas: no autenticado → `/login`, autenticado → `/`.
- Gestión de cookies SSR para tokens de sesión.

### 4 · Autenticación — Login
- Página `/login/page.tsx` con formulario email + contraseña.
- Integración con `supabase.auth.signInWithPassword()`.
- Redirección a `/` post-login exitoso.
- Diseño dark-theme integrado con tokens CSS.

### 5 · Tipos y utilidades compartidas
- `lib/types.ts`: interfaces `Ticket`, `PendingMove`, `ToastItem`, `MovementLog`, tipos `EstadoFilter`, `PrioridadFilter`, `View`, `Theme`.
- `lib/utils.ts`: `cn()`, `normalizeEstado()`, `formatDate()`, `getSyncTimeStr()`, helpers de badges (`badgePrioridad`, `badgeEstado`, `badgeCat`).
- `lib/validation.ts`: validaciones `validateEmail`, `validateNombre`, `validateDescripcion`, `validateCategoria`, `validatePrioridad` + constantes `ALLOWED_EMAIL_DOMAINS`, `ALLOWED_CATEGORIAS`, `ALLOWED_PRIORIDADES`.
- `lib/data.ts`: 18 tickets mock con timestamps dinámicos (`MOCK_DATA`).

### 6 · Cliente Supabase (Server + Browser)
- `lib/supabase.ts`: `createClient` para operaciones server-side.
- `lib/supabase-browser.ts`: `createSupabaseBrowser()` para contexto cliente.

### 7 · Componentes core de UI

| Componente | Funcionalidad |
|---|---|
| `Header.tsx` | Logo, vista toggle (tabla/kanban), tema toggle dark/light, sync, logout, timestamp última sync |
| `StatsBar.tsx` | 4 celdas con barras animadas: Total, Abiertos, En proceso, Resueltos |
| `FiltersRow.tsx` | Chips de estado + prioridad + búsqueda con debounce 200ms |
| `TicketTable.tsx` | Tabla con skeleton loading, stagger animation, paginación visual, imagen adjunta |
| `KanbanBoard.tsx` | 4 columnas con drag&drop pointer-event nativo, tilt card, highlight columna destino, animación landing |
| `Modal.tsx` | Confirmación de movimiento con select responsable, textarea acción, campo área (si "Otra área") |
| `ToastContainer.tsx` | Toasts animados (in/out) con `dangerouslySetInnerHTML` |
| `ConfigBanner.tsx` | Banner de alerta (oculto por defecto) para configuración de Google Sheets |

### 8 · Página principal — Dashboard (`app/page.tsx`)
- Carga de datos desde Supabase (`supabase.from('tickets').select('*')`) con fallback a mock data.
- Auto-refresh configurable (60s por defecto, `setInterval`).
- Tema toggle con `localStorage` + atributo `data-theme`.
- Toasts con IDs únicos y cleanup automático.
- Animación de landing en kanban (`animate-card-land`).
- Vista condicional tabla/kanban con `key` para forzar remount.
- Botón "Nueva Solicitud" → abre `NuevaSolicitudModal`.
- Footer con conteo filtrado/total de tickets.

### 9 · Formulario público de solicitudes (`app/solicitud/page.tsx`)
- Ruta pública (sin auth required via middleware).
- Flujo multi-step: `form` → `success`.
- Campos: nombre, email corporativo, categoría (chip selector), prioridad (grid de 3), descripción + contador caracteres.
- Dropzone para imagen adjunta con drag&drop, preview, validación tipo/tamaño (máx 5MB, JPG/PNG/GIF/WEBP).
- Generación de `ticket_id` autoincremental desde Supabase (`TK-0001`, `TK-0002`…).
- Subida de imagen a Supabase Storage (`bucket: ticket-attachments`) y almacenamiento de URL pública en `imagen_url`.
- Inserción directa en tabla `tickets` con estado `Abierto`.
- Validación server-side de email corporativo (`travelkit.co`, `travelkit.us`).
- Pantalla de éxito con ID del ticket generado.

### 10 · Modal inline "Nueva Solicitud" (`components/NuevaSolicitudModal.tsx`)
- Modal animado (slide + scale + fade) sobre backdrop blur.
- Campos: categoría, prioridad, descripción.
- Imagen adjunta con dropzone y preview.
- Mismo flujo de generación de ID + upload + insert.
- Escape key + overlay click para cerrar.
- Auto-focus en textarea al abrir.

### 11 · Creación de tablas Supabase (`lib/create-tables.ts`)
- Script de inicialización con **service role key** (solo para setup, no expuesto al cliente).
- Tabla `tickets`: `ticket_id` (PK text), `timestamp`, `email`, `categoria`, `prioridad`, `descripcion`, `estado`, `responsable`, `area`, `imagen_url`.
- Tabla `categorias_it`: catálogo de categorías IT.
- Tabla `solicitudes_it`: solicitudes independientes con UUID.
- Upsert con `onConflict: 'ticket_id'`.

### 12 · Storage de imágenes (`lib/storage.ts`)
- Bucket `ticket-attachments` (debe crearse manualmente en Supabase Dashboard).
- Función `uploadTicketImage(ticketId, file)` → upload + URL pública.
- Función `validateImageFile(file)` → validación tipo MIME y tamaño.

### 13 · Dashboard Ejecutivo (`app/executive/page.tsx`)
- Vista light-theme independiente (no comparte diseño con el main dashboard).
- KPIs: SLA, Total abiertos, Tasa resolución, Tiempo 1ra respuesta.
- Gráficos: Donut (distribución por área) + Barras horizontal (top 5 problemas) via Recharts.
- Tabla de tickets críticos con estado "Espera" animado con pulso.
- Lista de monitoreo de proyectos/integra-
- Sidebar desplegable animado.

### 14 · Componentes shadcn/ui base
- `components/ui/card.tsx` — Card, CardContent, CardHeader, CardTitle, CardDescription.
- `components/ui/button.tsx` — Button con variantes.
- `components/ui/chart.tsx` — ChartContainer, ChartTooltip, ChartTooltipContent.
- `components/ui/table.tsx` — Table, TableBody, TableCell, TableHead, TableHeader, TableRow.

### 15 · Scripts de prueba y scratch
- `scratch/test-db.ts` — Tests de conexión Supabase.
- `scratch/test-query.ts` — Queries de prueba.
- `scratch/seed.ts` — Seed de datos mock.
- `create-table.ps1` — PowerShell helper para crear bucket de storage.

---

## Deuda Técnica / Pendientes Inmediatos

### Críticos (bloquean producción)

1. **Storage bucket no creado**: `ticket-attachments` debe crearse manualmente en Supabase Dashboard → Storage. Sin esto, `uploadTicketImage()` fallará silenciosamente.

2. **Tabla `movement_log` no existe**: El modal de movimiento ya llena el `MovementLog` en memoria (`movementLog.current`) pero nunca lo persiste. Hay que crear la tabla:
   ```sql
   CREATE TABLE IF NOT EXISTS movement_log (
     id BIGSERIAL PRIMARY KEY,
     ticket_id TEXT REFERENCES tickets(ticket_id),
     de TEXT NOT NULL,
     a TEXT NOT NULL,
     responsable TEXT NOT NULL,
     area TEXT,
     accion TEXT,
     timestamp TIMESTAMPTZ DEFAULT now()
   );
   ```

3. **Responsables hardcodeados**: La lista de responsables en `Modal.tsx` (`Jefferson Carvajal`, `Santiago Morales`) debe extraerse dinámicamente de una tabla `responsables` o `usuarios_it` en Supabase.

### Medios (afectan experiencia)

4. **Dashboard ejecutivo con mock data**: `app/executive/page.tsx` usa datos hardcodeados en `mockKPIs`, `mockCriticalTickets`, etc. Hay que reemplazar con queries reales a Supabase.

5. **Validación email en `/solicitud`**: El campo email es de solo lectura cuando se abre desde el modal (toma `userEmail` del session), pero en el formulario público `/solicitud` el usuario puede escribir cualquier email. Falta verificar pertenencia al dominio corporativo o pre-autocompletar desde sesión.

6. **SLA / métricas no calculadas**: No existen columnas como `sla_deadline`, `first_response_at`, `resolved_at` en la tabla `tickets`.

7. **Auto-refresh sin indicador visual**: El `setInterval` refresh corre en background pero no hay spinner global durante el refresh.

8. **Sin paginación**: Si hay >100 tickets, la tabla renderiza todos. Agregar paginación server-side.

### Menores (mejora continua)

9. **Error banner de Google Sheets comentado**: El `#errorBanner` en `app/page.tsx` está oculto y preparado para integración con Google Sheets (comentado al final del archivo). Eliminar o documentar como feature deprecated.

10. **Tabla `categorias_it` y `solicitudes_it` no se usan**:Fueron creadas en `create-tables.ts` pero ningún componente las consume. O integrarlas al flow o eliminarlas.

11. **Logo hardcodeado**: `travelkit-logo_nbtjgf-67feae5fe38949.68302424.png` está en `public/`. Verificar que exista.

12. **Límite de búsqueda debounced**: El `FiltersRow` usa `setTimeout` manual para debounce 200ms. Reemplazar por `useDebouncedCallback` de `react-use` o similar.

---

## Próximos Hitos Sugeridos

1. Crear bucket `ticket-attachments` en Supabase Storage.
2. Crear tabla `movement_log` en SQL Editor.
3. Crear tabla `responsables` y alimentar el select del modal.
4. Conectar dashboard ejecutivo a datos reales.
5. Agregar paginación y/o infinite scroll en la tabla.
6. Implementar notificaciones por email (Supabase Edge Functions + Resend).
7. Dashboard para usuario final: "mis tickets" con historial.
8. Mobile responsive completo para el kanban.

---

*Última actualización: Abril 2026 · Generado por ingeniería inversa del codebase*