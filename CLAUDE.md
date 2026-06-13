# CLAUDE.md — travelkit_Helpdesk_casos_criticos

## Qué es este proyecto

Herramienta interna de Travelkit Colombia para gestión de **casos críticos de IT**.
Es un fork de `travelkit_Helpdesk_IT` adaptado a un flujo de escalación y seguimiento de incidentes críticos.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + tokens `tk-*` |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth SSR |
| Storage | Supabase Storage (bucket `ticket-attachments`) |
| Correos | Resend |
| Iconos | Lucide React |
| Fuentes | IBM Plex Sans + IBM Plex Mono |
| Animaciones | tw-animate-css + keyframes en `globals.css` |

## Estructura de carpetas

```
src/
├── app/
│   ├── layout.tsx          ← fuentes IBM Plex, tema dark/light, metadata
│   ├── globals.css         ← variables CSS --tk-*, keyframes, clases globales
│   └── [módulo]/page.tsx
├── components/
│   ├── layout/             ← Header, ConfigBanner
│   ├── common/             ← Modal, ToastContainer
│   └── ui/                 ← button, card, table (shadcn base)
├── features/
│   └── [módulo]/
│       ├── actions/        ← server actions
│       ├── components/
│       ├── types/
│       └── utils/
└── lib/
    ├── supabase/           ← client.ts, server.ts, storage.ts
    └── utils.ts            ← cn() y helpers
```

## Design system

El diseño está definido en `IDENTIDAD-VISUAL.md` en la raíz. Leerlo antes de crear cualquier componente nuevo.

Resumen de reglas críticas:
- **Tema oscuro por defecto** (`data-theme="dark"` en `<html>`)
- **Fuente sans**: IBM Plex Sans → texto general, labels, descripciones
- **Fuente mono**: IBM Plex Mono → IDs, badges, contadores, timestamps, botones de acción
- **Color acento**: `--accent: #4fc3f7` (azul claro) / en Tailwind: `text-tk-accent`, `bg-tk-accent`
- **Color brand Travelkit**: `#E30613` (rojo) → botones primarios, indicadores activos
- **Tokens de color**: siempre usar clases `tk-*` (ej. `bg-tk-bg2`, `text-tk-text2`, `border-tk-border`)
- **No emojis** en la UI. Usar Lucide React para iconos
- **Animaciones funcionales**: `animate-fade-up` (modales), `animate-toast-in/out` (toasts), `animate-slide-in` (cards)

## Variables de entorno necesarias

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
```

## Comandos

```bash
pnpm install     # instalar dependencias
pnpm dev         # servidor de desarrollo en localhost:3000
pnpm build       # build de producción
```

## Convenciones

- Nombres de componentes en PascalCase (`NuevaSolicitudModal`)
- Server Actions en `features/[módulo]/actions/`
- Tipos TypeScript en `features/[módulo]/types/index.ts`
- Nunca hardcodear colores — siempre usar tokens CSS `var(--tk-*)` o clases Tailwind `tk-*`
- Números siempre con `tabular-nums` para alineación vertical
- Cards interactivas con hover lift: `hover:-translate-y-px hover:shadow-md transition-all`
- El tema persiste en `localStorage` bajo la clave `tk-theme` (`"dark"` | `"light"`)

## Estado del proyecto base (heredado)

- Tablas Supabase: `tickets`, `categorias_it`, `solicitudes_it`
- Auth y middleware configurados
- Vistas tabla y kanban operativas con drag & drop
- Formulario público en `/solicitud` (sin auth)
- Dashboard ejecutivo en `/executive` (datos mock, pendiente conectar a Supabase)
- Envío de email via Resend (revisar `/api/send-ticket-email`)
- Bucket de Storage `ticket-attachments` debe existir en Supabase Dashboard
