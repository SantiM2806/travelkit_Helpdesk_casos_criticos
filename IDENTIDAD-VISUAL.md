# Identidad Visual — Travelkit CRM

> Documento de referencia completo del sistema de diseño del prototipo.
> Toda la identidad visual, tipografía, componentes y patrones implementados.
> Última actualización: junio 2026.

## Índice

1. [Marca](#1-marca)
2. [Paleta de colores](#2-paleta-de-colores)
3. [Tipografía](#3-tipografía)
4. [Espaciado](#4-espaciado)
5. [Border radius](#5-border-radius)
6. [Sombras](#6-sombras)
7. [Iconografía](#7-iconografía)
8. [Animaciones y movimiento](#8-animaciones-y-movimiento)
9. [Componentes UI base](#9-componentes-ui-base)
10. [Patrones de UX](#10-patrones-de-ux)
11. [Estados de interacción](#11-estados-de-interacción)
12. [Densidad de información](#12-densidad-de-información)
13. [Accesibilidad](#13-accesibilidad)
14. [Reglas de oro](#14-reglas-de-oro-del-diseño)

---

## 1. Marca

### 1.1 Nombre del producto

**Travelkit** — escrito siempre así, sin variantes ("TravelKit", "Travel Kit", "TRAVELKIT" en wordmark).

### 1.2 Logo

El logo es un **wordmark "TRAVELKIT"** en mayúsculas, geométrico, gruesidad alta (font-weight 900), color rojo Travelkit `#E30613`.

**Componente:** `components/brand/travelkit-logo.tsx`

**Comportamiento:**
- Intenta cargar `/public/brand/logo.png` (versión oficial).
- Si no existe el archivo, hace **fallback automático** a wordmark en CSS con fuente Inter Black uppercase.
- Ratio aproximado del wordmark: **6:1** (ancho:alto).
- Factor de tipografía en fallback: `width × 0.17`.

**Tamaños usados en el producto:**
| Contexto | width |
|---|---|
| Sidebar (header) | 130px |
| Landing principal | 220px |
| Login (futuro) | 280px |

### 1.3 Eslogan

**"Tu aliado en asistencia y conectividad"** — frase oficial de Travelkit. Usar discretamente en contextos de bienvenida o marketing del producto. NO en interfaces operativas.

---

## 2. Paleta de colores

### 2.1 Color de marca (Brand)

Color principal: **`#E30613`** (rojo Travelkit oficial, extraído del logo).

Paleta completa para variaciones de uso:

| Token | Hex | Uso típico |
|---|---|---|
| `brand-50` | `#FEF2F2` | Fondos sutiles de cards de marca, hover de menu items |
| `brand-100` | `#FEE2E2` | Badges suaves, tags activos |
| `brand-200` | `#FECACA` | Borders en estados hover |
| `brand-300` | `#FCA5A5` | Hovers de bordes en cards |
| `brand-400` | `#F87171` | Acentos secundarios |
| `brand-500` | `#EF4444` | Acentos enérgicos |
| **`brand-600`** | **`#E30613`** | **Color principal** — botones, links, indicadores activos |
| `brand-700` | `#C70511` | Hover de botones primarios, links hover |
| `brand-800` | `#A1040E` | Estados active (pressed) |
| `brand-900` | `#7F030B` | Texto sobre fondos brand muy claros |

**Reglas de uso del color brand:**
- ✅ Botón primario "+ Nuevo lead"
- ✅ Indicador del menú activo en sidebar
- ✅ Subrayado de tab activa
- ✅ Links accionables ("Ver pipeline completo →")
- ✅ Punto rojo de notificaciones (con `animate-ping`)
- ✅ Números críticos en KPIs (cuando un dato necesita destacar)
- ❌ NO usar para todos los CTAs (pierde fuerza)
- ❌ NO usar como fondo dominante de pantallas
- ❌ NO mezclar con otros rojos no-brand (excepto `danger`)

### 2.2 Colores semánticos

Comunican significado universal. Mismos códigos en toda la app.

| Significado | Token | Hex | Uso |
|---|---|---|---|
| **Éxito** | `success` | `#10B981` | SLA OK, etapas ganadas, leads aprobados, badges positivos |
| **Advertencia** | `warning` | `#F59E0B` | SLA en riesgo, propuestas en espera, leads que se enfrían |
| **Peligro** | `danger` | `#DC2626` | SLA atrasado, leads críticos, errores, perdidos |
| **Información** | `info` | `#3B82F6` | Notas, prospectos, comentarios neutros, leads activos |

**Variantes claras (tones de fondo para badges/alertas):**

```css
emerald-50: #ECFDF5    /* fondo de badge éxito */
emerald-700: #047857   /* texto sobre fondo emerald-50 */

amber-50: #FFFBEB
amber-700: #B45309

red-50: #FEF2F2
red-700: #B91C1C

blue-50: #EFF6FF
blue-700: #1D4ED8
```

### 2.3 Colores de avatares

Los avatares de personas y agencias usan **iniciales con fondo de color determinístico** generado a partir del nombre. La paleta está curada para NO chocar con el brand.

```ts
// lib/utils.ts → stringToColor()
const avatarColors = [
  "#7C3AED",  // violet
  "#2563EB",  // blue
  "#0891B2",  // cyan
  "#059669",  // emerald
  "#CA8A04",  // amber
  "#EA580C",  // orange
  "#DB2777",  // pink
  "#475569",  // slate
];
```

**Razón:** rojos están excluidos para no competir con el brand. Variedad para que los avatares se distingan entre sí.

### 2.4 Colores neutros (estructura)

| Token | Hex | Uso |
|---|---|---|
| `background` | `#FFFFFF` | Fondo principal de la app, cards |
| `surface` | `#FAFAFA` | Fondo del área de contenido (debajo del header) |
| `border` | `#E5E7EB` | Bordes de cards, divisores, sticky headers |
| `muted` | `#F3F4F6` | Fondos sutiles de inputs no focused |
| `gray-50` | `#F9FAFB` | Hover de filas, fondos de cards secundarias |
| `gray-100` | `#F3F4F6` | Fondos de chips, badges neutros |

### 2.5 Colores de texto

| Token | Hex | Uso |
|---|---|---|
| `text-primary` | `#0A0A0A` | Títulos, datos principales, valores |
| `text-secondary` | `#6B7280` | Subtítulos, metadata, descripciones |
| `text-tertiary` | `#9CA3AF` | Labels en mayúsculas, footers, separadores |

---

## 3. Tipografía

### 3.1 Familia tipográfica

**Inter** — sans-serif geométrica, alta legibilidad, optimizada para pantallas.

Cargada vía `next/font/google` con variable `--font-inter`. Soporta features OpenType activos: `rlig` (ligaduras), `calt` (alternativas contextuales), `cv11` (alternativa de la "a"/"g").

```ts
// app/layout.tsx
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
```

**Fallback stack:** `Inter, system-ui, -apple-system, sans-serif`.

### 3.2 Pesos disponibles

| Peso | Token Tailwind | Uso |
|---|---|---|
| 400 | `font-normal` | Cuerpo de texto, descripciones largas |
| 500 | `font-medium` | Metadata, etiquetas, badges |
| 600 | `font-semibold` | Subtítulos, nombres, datos importantes |
| 700 | `font-bold` | KPIs grandes, headers de sección, números prominentes |
| 900 | `font-black` | **Solo el wordmark TRAVELKIT** del logo |

### 3.3 Tamaños y jerarquía

| Token | Tamaño | Line height | Uso típico |
|---|---|---|---|
| `text-[10px]` | 10px | tight | Etiquetas en UPPERCASE (TIPOS, ESTADO) |
| `text-[11px]` | 11px | tight | Badges, micro-info |
| `text-xs` | 12px | 16px | Metadata, footers, subtítulos pequeños |
| `text-sm` | 14px | 20px | Cuerpo de texto base, inputs, descripciones |
| `text-base` | 16px | 24px | Texto destacado en cards, descripciones de KPIs |
| `text-lg` | 18px | 28px | Subtítulos de cards |
| `text-xl` | 20px | 28px | Títulos de sección ("Mi día", "Leads que necesitan atención") |
| `text-2xl` | 24px | 32px | Números de KPIs |
| `text-3xl` | 30px | 36px | Títulos de pantalla ("Leads", "Tareas", "Reportes") |
| `text-4xl` | 36px | 40px | Hero greetings ("Buenos días, Jefferson") |
| `text-5xl` | 48px | 1 | Cifras dominantes (meta del mes) |

### 3.4 Tracking (letter-spacing)

- **Títulos**: `tracking-tight` (-0.025em) — más compactos, más impacto.
- **Logo wordmark**: `letter-spacing: -0.02em` (manual) — geometría apretada.
- **Etiquetas en mayúsculas**: `tracking-wider` (+0.05em) — respiración para legibilidad.

### 3.5 Tabular numbers

**Regla obligatoria:** todos los números deben usar `tabular-nums` para alineación perfecta vertical.

**Dónde aplicar:**
- ✅ KPIs (todos los números grandes)
- ✅ Contadores (12 leads, 5 tareas)
- ✅ Porcentajes (33%, 28%)
- ✅ Días en etapa (3d, 6d)
- ✅ Horas (10:30 AM)
- ✅ Versiones (v1.0.0)
- ✅ NITs, teléfonos (también `font-mono` para enfatizar)
- ❌ NO en texto narrativo ("tres días")

```tsx
<span className="text-2xl font-bold tabular-nums">24</span>
```

### 3.6 Patrones tipográficos por contexto

**Hero de pantalla:**
```tsx
<h1 className="text-3xl font-bold tracking-tight text-text-primary">
  Leads
</h1>
<p className="mt-1.5 text-sm text-text-secondary">
  Tu cartera completa de prospectos y clientes.
</p>
```

**Hero de dashboard (saludo):**
```tsx
<h1 className="text-3xl font-bold tracking-tight">
  Buenos días, Jefferson
</h1>
```

**Sección dentro de pantalla:**
```tsx
<h2 className="text-xl font-semibold text-text-primary">
  Mi día
</h2>
```

**Subtitulo de card:**
```tsx
<h3 className="text-base font-semibold text-text-primary">
  Aventura Tours
</h3>
```

**Etiquetas en MAYÚSCULAS (KPI labels, sección headers internos):**
```tsx
<p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
  CARTERA ACTIVA
</p>
```

**Valor de KPI:**
```tsx
<p className="text-2xl font-bold tabular-nums text-text-primary">24</p>
```

**Cifra dominante (meta del mes):**
```tsx
<p className="text-5xl font-bold tabular-nums">$480M</p>
```

---

## 4. Espaciado

Sistema basado en múltiplos de 4px (Tailwind default).

### 4.1 Padding interno de componentes

| Componente | Padding |
|---|---|
| Cards generales | `p-5` (20px) o `p-6` (24px) |
| Cards de KPI | `p-5` (20px) |
| Cards densas (lead-card) | `p-3` (12px) |
| Buttons sm | `px-3 py-1.5` |
| Buttons md | `px-4 py-2.5` |
| Buttons lg | `px-6 py-3` |
| Inputs | `px-3 py-2.5` (h-10) |
| Badges | `px-2 py-0.5` |

### 4.2 Espaciado entre elementos

| Contexto | Gap |
|---|---|
| Items de lista densa | `space-y-0.5` (2px) |
| Items de lista normal | `space-y-2` (8px) |
| Cards en grid | `gap-3` (12px) o `gap-4` (16px) |
| Secciones grandes | `mb-6` (24px) o `mb-8` (32px) |
| Secciones del dashboard | `mb-10` (40px) |

### 4.3 Padding de pantalla

```tsx
<div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
```

- **Mobile/tablet**: `px-6 py-8` (24px laterales, 32px verticales)
- **Desktop (lg)**: `px-10 py-10` (40px laterales, 40px verticales)
- **Ancho máximo**: `max-w-7xl` (1280px) — para que el contenido no se estire demasiado en pantallas anchas.

---

## 5. Border radius

| Token | Valor | Uso |
|---|---|---|
| `rounded-sm` | 4px | (No usado actualmente) |
| `rounded` | 6px | Inputs sutiles, chips muy pequeños |
| `rounded-md` | 8px | Botones, inputs medianos, chips de filtro |
| `rounded-lg` | 12px | Cards, modales, dropdowns |
| `rounded-xl` | 16px | Cards de KPI, paneles, cards principales |
| `rounded-2xl` | 16px | Hero cards (meta del mes) |
| `rounded-full` | 50% | Badges pill, avatars, dots |

**Regla general:** cuanto más grande el componente, más grande el radius.

---

## 6. Sombras

| Token | Uso |
|---|---|
| `shadow-sm` | Cards en estado normal, sticky headers con sutil elevación |
| `shadow-md` | Cards al hover (interactivas) |
| `shadow-lg` | Dropdowns abiertos |
| `shadow-xl` | Cards arrastradas en Kanban |
| `shadow-2xl` | Detail panels desde la derecha, modales |

**Reglas:**
- Sombras siempre sutiles, nunca dramáticas.
- En cards interactivas: `transition-all` + `hover:-translate-y-px hover:shadow-md` (lift effect).
- Paneles deslizables: sombra hacia el lado de entrada (`shadow-2xl` natural).

---

## 7. Iconografía

### 7.1 Librería

**Lucide React** (`lucide-react`). Iconos geométricos, stroke uniforme, alta consistencia.

### 7.2 Tamaños usados

| Tamaño | Tailwind | Uso |
|---|---|---|
| 10px | `h-2.5 w-2.5` | Mini-icons en badges muy pequeños |
| 12px | `h-3 w-3` | Iconos en chips, dots con icono |
| 14px | `h-3.5 w-3.5` | Iconos en filas de datos, acciones en hover |
| 16px | `h-4 w-4` | **Tamaño por defecto** (sidebar nav, buttons, headers) |
| 20px | `h-5 w-5` | Iconos en cards de KPI, hero icons |
| 24px | `h-6 w-6` | Iconos prominentes en empty states |

### 7.3 Stroke width

- **Default**: `strokeWidth={2}` — equilibrio entre presencia y elegancia.
- **Énfasis**: `strokeWidth={2.5}` — para flechas accionables, checks importantes.
- **Bold visual**: `strokeWidth={3}` — solo en checkmark de checkbox completado.

### 7.4 Iconos por contexto recurrente

| Concepto | Icono Lucide |
|---|---|
| Inicio | `Home` |
| Pipeline | `Columns` |
| Leads | `Users` |
| Tareas | `CheckSquare` |
| Agencias | `Building2` |
| Reportes | `BarChart3` |
| Configuración | `Settings` |
| Ayuda | `HelpCircle` |
| Notificaciones | `Bell` |
| Búsqueda | `Search` |
| Nuevo | `Plus` |
| Cerrar | `X` |
| Más acciones | `MoreVertical` o `MoreHorizontal` |
| Anterior/Siguiente | `ChevronLeft` / `ChevronRight` |
| Expandir | `ChevronDown` |
| Acción avanzar | `ArrowRight` |
| Llamada | `Phone` |
| Email | `Mail` |
| WhatsApp | `MessageCircle` |
| Visita / Mapa | `MapPin` |
| Reunión | `Calendar` |
| Propuesta | `FileText` |
| Atrasada / Reloj | `Clock` |
| Alerta | `AlertTriangle` |
| Alerta crítica | `AlertOctagon` |
| Ganado / Trofeo | `Trophy` |
| Perdido | `XCircle` |
| Recuperable | `RotateCcw` |
| Lead nuevo | `Sparkles` |
| Stage change | `ArrowRight` |
| Tendencia abajo | `TrendingDown` |
| Tendencia arriba | `TrendingUp` |
| Saludable | `ShieldCheck` |
| Foco / Objetivo | `Target` |

---

## 8. Animaciones y movimiento

### 8.1 Filosofía

Las animaciones son **funcionales**, no decorativas. Sirven para:
- Guiar la atención (qué cambió).
- Dar feedback de acción (sí, completaste algo).
- Indicar estado (esto es crítico, pulsa).
- Comunicar jerarquía (entra primero el contexto, luego los detalles).

**Duración base:** 150-300ms. Más rápido se siente brusco, más lento se siente lento.

### 8.2 Keyframes definidos (`app/globals.css`)

```css
@keyframes slide-up-fade {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.4; }
}

@keyframes check-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 8.3 Clases de utilidad

| Clase | Duración | Easing | Uso |
|---|---|---|---|
| `animate-slide-up` | 400ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrada de secciones/cards al cargar |
| `animate-pulse-dot` | 2s infinite | `ease-in-out` | Indicadores críticos (rojo punto SLA) |
| `animate-check-pop` | 280ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` (bouncy) | Checkmark al completar tarea |
| `animate-shimmer` | 1.6s infinite | `ease-in-out` | Placeholders de carga (no usado activamente) |
| `animate-ping` | (built-in Tailwind) | | Halo en bell de notificaciones |

### 8.4 Stagger system (entrada secuencial)

Para que las secciones aparezcan una tras otra al cargar la página.

```css
.stagger-1 { animation-delay: 0ms; }
.stagger-2 { animation-delay: 80ms; }
.stagger-3 { animation-delay: 160ms; }
.stagger-4 { animation-delay: 240ms; }
.stagger-5 { animation-delay: 320ms; }
.stagger-6 { animation-delay: 400ms; }
```

**Uso típico en una página:**
```tsx
<div className="animate-slide-up">Header</div>
<div className="animate-slide-up stagger-1">KPIs</div>
<div className="animate-slide-up stagger-2">Tabs</div>
<div className="animate-slide-up stagger-3">Filtros</div>
<div className="animate-slide-up stagger-4">Contenido principal</div>
```

### 8.5 Transitions de Tailwind (estados)

| Clase | Velocidad | Uso |
|---|---|---|
| `transition-colors` | 150ms | Cambios de color al hover (botones, links) |
| `transition-all` | 150ms | Cambios múltiples (cards al hover) |
| `transition-transform` | 200ms | Movimiento (scale, translate) |
| `duration-200` | sobrescribe | Para transiciones medianas |
| `duration-300` | sobrescribe | Slide-in de paneles laterales |
| `duration-700` | sobrescribe | Barras de progreso |

### 8.6 Patrones de microinteracción

**Card al hover (lift effect):**
```tsx
className="transition-all duration-200 hover:-translate-y-px hover:shadow-md"
```

**Button al hover (scale):**
```tsx
className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
```

**Icono al hover (rotación, scale):**
```tsx
className="transition-transform group-hover:scale-110"
className="transition-transform group-hover:rotate-45"  /* Engranaje de Configuración */
```

**Chevron al expandir:**
```tsx
className={cn("transition-transform", isOpen && "rotate-180")}
```

**ArrowRight al hover (desplazamiento):**
```tsx
className="transition-transform group-hover:translate-x-0.5"
```

---

## 9. Componentes UI base

### 9.1 Avatar

**Componente:** `components/ui/avatar.tsx`

- Renderiza un círculo con las **iniciales del nombre** (2 letras).
- Fondo de color generado determinísticamente desde el string (paleta curada sin rojo brand).
- Tamaños: `xs` (24px), `sm` (32px), `md` (40px), `lg` (48px).
- Texto blanco bold.

```tsx
<Avatar name="Jefferson Doe" size="md" />
```

### 9.2 Badge

**Componente:** `components/ui/badge.tsx`

Pill rounded-full con padding compacto. 7 variants:

| Variant | Fondo | Texto | Uso |
|---|---|---|---|
| `default` | `bg-gray-100` | `text-gray-700` | Neutral, sin connotación |
| `brand` | `bg-brand-50` | `text-brand-700` | Etapa actual, indicador de marca |
| `success` | `bg-emerald-50` | `text-emerald-700` | Ganados, completadas |
| `warning` | `bg-amber-50` | `text-amber-700` | En riesgo |
| `danger` | `bg-red-50` | `text-red-700` | Atrasadas, perdidos |
| `info` | `bg-blue-50` | `text-blue-700` | Activos, neutros informativos |
| `outline` | `bg-white border` | `text-text-secondary` | Etiquetas sutiles |

Tamaño: `text-xs px-2 py-0.5`.

### 9.3 Button

**Componente:** `components/ui/button.tsx`

5 variants × 4 sizes.

**Variants:**
- `primary`: `bg-brand-600 text-white` — CTA principal, "+ Nuevo lead"
- `secondary`: `bg-white border` — Acciones secundarias, "Cancelar"
- `outline`: `bg-transparent border` — Acciones discretas
- `ghost`: `bg-transparent` — Acciones muy discretas
- `danger`: `bg-red-600 text-white` — Eliminar, archivar destructivamente

**Sizes:** `sm` (h-8), `md` (h-9), `lg` (h-11), `icon` (h-9 w-9, sin label).

**Estados implícitos:**
- Hover: brand-700 / red-700
- Active (pressed): brand-800 / red-800
- Disabled: `opacity-50 cursor-not-allowed`
- Focus visible: `ring-2 ring-brand-500/40 ring-offset-2`

### 9.4 Card

**Componente:** `components/ui/card.tsx`

Contenedor blanco con:
- `bg-white`
- `border border-border`
- `rounded-xl` (12px)
- Padding según contexto

Sub-componentes: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`.

### 9.5 Dropdown

**Componente:** `components/ui/dropdown.tsx`

- Click-outside para cerrar.
- Esc para cerrar.
- Soporta `position: "top" | "bottom"`.
- Soporta `align: "left" | "right"`.
- Animación `animate-slide-up` al abrir.
- Trigger render-props para máxima flexibilidad.

**Uso típico:**
```tsx
<Dropdown
  trigger={({ open, toggle }) => <button onClick={toggle}>...</button>}
>
  {(close) => <div>... contenido del dropdown ...</div>}
</Dropdown>
```

---

## 10. Patrones de UX

### 10.1 Cards interactivas (lift effect)

Patrón usado para todas las cards clickeables:

```tsx
className="rounded-xl border border-border bg-white p-5 transition-all hover:-translate-y-px hover:border-brand-200 hover:shadow-md"
```

**Componentes que lo usan:** AgencyCard, KPI cards, AttentionCard, etc.

### 10.2 Borde lateral SLA en cards

**Concepto:** un borde izquierdo de 4px de color que comunica urgencia sin texto.

```tsx
<div className="border-l-4 border-l-emerald-500">  {/* OK */}
<div className="border-l-4 border-l-amber-400">    {/* En riesgo */}
<div className="border-l-4 border-l-red-500">      {/* Atrasado */}
```

**Razón UX:** al barrer una columna con los ojos, identificas urgencia instantáneamente sin tener que leer cada card.

**Componentes que lo usan:** LeadCard del Kanban, filas de tabla de leads.

### 10.3 Sticky headers

En tablas largas, el header siempre visible:

```tsx
<thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm">
```

**Backdrop blur** para que se vea elegante cuando hay scroll detrás.

### 10.4 Detail panels (slide-overs desde la derecha)

Patrón clave del producto. Reemplaza modales centrados.

- **Ancho**: `max-w-[520px]` para LeadDetailPanel, `max-w-[460px]` para AgencyDetailPanel.
- **Posición**: `fixed right-0 top-0 h-screen z-40`.
- **Entrada**: `translate-x-full → translate-x-0` con `duration-300 ease-out`.
- **Overlay**: `fixed inset-0 z-30 bg-black/30 backdrop-blur-sm`, clickeable para cerrar.
- **Cierre**: Esc, click en overlay, X del header.
- **Header sticky** con backdrop-blur.

**Razón UX:** mantiene el contexto visible detrás (el Kanban o la tabla). No rompe el flujo.

### 10.5 Bulk actions bar (barra flotante)

Aparece flotando en la parte inferior cuando hay 2+ items seleccionados.

```tsx
<div className="fixed inset-x-0 bottom-6 z-50 flex justify-center">
  <div className="bg-gray-900 text-white shadow-2xl rounded-xl px-3 py-2 animate-slide-up">
    ...
  </div>
</div>
```

- Fondo **negro** (`bg-gray-900`) — alto contraste con el resto.
- Animación `slide-up` al aparecer.
- Contador en **rojo brand** prominente.
- Separadores verticales blancos sutiles entre grupos de acciones.

### 10.6 Empty states con calidez

NO usar mensajes secos como "Sin resultados". Usar texto cálido con icono.

**Patrón:**
```tsx
<div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-white py-12 text-center">
  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
    <Sparkles className="h-5 w-5 text-brand-600" />
  </div>
  <p className="text-sm font-semibold text-text-primary">Día limpio</p>
  <p className="mt-1 max-w-xs text-xs text-text-secondary">
    No tienes tareas para hoy. Aprovecha para prospectar nuevos leads.
  </p>
</div>
```

**Mensajes contextuales** según la situación:
- "Día limpio" / "Sin pendientes atrasados" / "Todo bajo control"
- Variantes según el tab activo.

### 10.7 Banners de insight / coaching

Mostrar insight automático en un banner sutil:

```tsx
<div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
    <Sparkles className="h-4 w-4 text-brand-600" />
  </div>
  <div>
    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
      Lectura del periodo
    </p>
    <p className="mt-0.5 text-sm text-text-primary">
      Excelente: cierras 60% de lo que pones a decisión.
    </p>
  </div>
</div>
```

**Colores según severidad:**
- Brand (rojo claro): insight general
- Amber: advertencia
- Emerald: positivo
- Blue: informativo

### 10.8 Tabs

Tabs con subrayado animado:

```tsx
<button className="relative -mb-px px-3 py-2.5 text-sm font-medium">
  {label}
  {isActive && (
    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />
  )}
</button>
```

**Con contador (badge interno):**
```tsx
{count > 0 && (
  <span className="rounded-full bg-brand-100 px-1.5 text-[10px] font-semibold text-brand-700">
    {count}
  </span>
)}
```

### 10.9 Filtros (chips)

Chip de filtro inactivo:
```tsx
className="border-border bg-white text-text-secondary"
```

Chip de filtro activo (con valor seleccionado):
```tsx
className="border-brand-300 bg-brand-50 text-brand-700"
```

Con contador de items seleccionados:
```tsx
<span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
  {count}
</span>
```

### 10.10 KPIs accionables

Estructura estándar:

```tsx
<div className="relative flex items-center gap-4 rounded-xl border border-border bg-white p-5">
  {/* Indicador pulsante si es crítico */}
  {alert && (
    <span className="absolute right-3 top-3 flex h-2 w-2">
      <span className="absolute animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative h-2 w-2 rounded-full bg-red-600" />
    </span>
  )}
  {/* Icono coloreado */}
  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
    <Icon className="h-5 w-5 text-brand-600" />
  </div>
  {/* Texto */}
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
      LABEL
    </p>
    <p className="mt-0.5 text-2xl font-bold tabular-nums text-text-primary">{value}</p>
    <p className="mt-0.5 text-xs text-text-tertiary">{subtitle}</p>
  </div>
</div>
```

### 10.11 Timeline vertical (actividades)

Línea vertical conectora con eventos:

```tsx
<ol className="relative">
  <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
  {events.map((event, idx) => (
    <li className="relative flex gap-3 pb-5">
      <div className="z-10 h-8 w-8 rounded-full ring-4 ring-white">
        <Icon />
      </div>
      <div>...descripción + autor + tiempo...</div>
    </li>
  ))}
</ol>
```

- Línea de fondo `bg-border` con z-index bajo.
- Iconos con `ring-4 ring-white` para "cortar" la línea visualmente.

### 10.12 Barras de progreso/proporción

**Mini-barras de salud (en cabeceras de columnas del Kanban):**
```tsx
<div className="flex h-1 overflow-hidden rounded-full bg-gray-200">
  <div className="bg-emerald-500" style={{ width: `${okPct}%` }} />
  <div className="bg-amber-400" style={{ width: `${warningPct}%` }} />
  <div className="bg-red-500" style={{ width: `${criticalPct}%` }} />
</div>
```

**Barras horizontales de proporción (Reportes):**
```tsx
<div className="relative h-7 overflow-hidden rounded-md bg-gray-100">
  <div
    className="absolute h-full bg-brand-400 transition-all duration-700"
    style={{ width: `${pct}%` }}
  />
</div>
```

**Transición:** `duration-700` para que la animación de carga sea suave.

### 10.13 Stagger animation al cargar pantalla

Cada sección entra secuencialmente:

```tsx
<div className="animate-slide-up">Header</div>
<div className="animate-slide-up stagger-1">KPIs</div>
<div className="animate-slide-up stagger-2">Tabs</div>
<div className="animate-slide-up stagger-3">Filtros</div>
<div className="animate-slide-up stagger-4">Contenido</div>
```

---

## 11. Estados de interacción

### 11.1 Hover

| Elemento | Cambio en hover |
|---|---|
| Card interactiva | `-translate-y-px` + `shadow-md` + `border-brand-200` |
| Botón primario | `bg-brand-700` |
| Botón secundario | `bg-gray-50` |
| Fila de tabla | `bg-gray-50` o `bg-brand-50/40` si seleccionada |
| Item de menú | `bg-gray-50` + `text-text-primary` |
| Icono accionable | `text-text-primary` (de tertiary) o color brand |
| Chevron de "ver más" | `translate-x-0.5` |
| Avatar/identidad | `opacity-80` |

### 11.2 Focus visible

Global rule en `globals.css`:

```css
*:focus-visible {
  @apply outline-none ring-2 ring-brand-500/40 ring-offset-2;
}
```

**Inputs en focus:**
```tsx
focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100
```

### 11.3 Active (pressed)

- Botones: `bg-brand-800` (más oscuro que hover).
- Botón primario con scale: `active:scale-[0.98]`.

### 11.4 Disabled

```tsx
disabled:cursor-not-allowed disabled:opacity-50
```

### 11.5 Selected (en listas/tablas)

- Background suave brand: `bg-brand-50/40`.
- Ring para énfasis: `ring-2 ring-brand-500 ring-offset-1`.
- Si es card: borde + sombra.

---

## 12. Densidad de información

### 12.1 Filosofía

**Densidad media-alta**, pero **respirable**. Mostrar mucho dato útil sin saturar.

Inspiración: Linear, Pipedrive, Attio. NO inspiración: Salesforce clásico (saturado), iOS Settings (muy aireado).

### 12.2 Reglas

- **Cards de KPI**: 4 por fila en desktop, 2 en tablet.
- **Cards de lead (Kanban)**: máximo 4-5 líneas de info.
- **Tablas**: padding `px-3 py-2.5` por celda — denso pero legible.
- **Listas**: separadores mínimos (`space-y-0.5`) entre items densos, `space-y-2` para items con cards.

### 12.3 Cuándo dar aire

- Entre secciones principales: `mb-8` (32px) o `mb-10` (40px).
- En empty states: `py-12` para que respire.
- En el hero de una pantalla: `mb-6` antes del contenido.
- En detail panels: `py-5` por sección.

---

## 13. Accesibilidad

### 13.1 Mínimos cumplidos

- **Contraste WCAG AA** en textos sobre fondos.
- **Focus rings** visibles en todo elemento focusable.
- **Aria-labels** en botones sin texto (iconos solos).
- **Aria-hidden** en decoraciones (indicadores SLA, divisores).
- **Roles semánticos** (`role="dialog"` en panels).
- **Keyboard nav**: Esc cierra overlays, Tab navega.

### 13.2 Patrones específicos

**Button sin label visible:**
```tsx
<button aria-label="Notificaciones">
  <Bell className="h-4 w-4" />
</button>
```

**Decoración invisible para AT:**
```tsx
<span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red-500" />
```

**Dialog:**
```tsx
<aside role="dialog" aria-label="Detalle de lead">
```

### 13.3 Animaciones reducidas

(Pendiente de implementar) Detectar `prefers-reduced-motion` y deshabilitar animaciones para usuarios sensibles.

---

## 14. Reglas de oro del diseño

Estas son las reglas que **no se rompen** en el producto.

### 14.1 Sin precios en vistas operativas

El CRM es de **seguimiento operativo** en Comercial y Gerente Regional. No mostramos `$`, `M`, `K`. Solo en Gerencia General (decisiones estratégicas).

### 14.2 Brand con moderación

El rojo Travelkit es **acento**, no fondo. Si una pantalla tiene >5 elementos en rojo brand, hay algo mal.

### 14.3 Cada visualización con insight

En reportes y dashboards, NO mostrar solo data. Interpretar:
- "Tu mejor fuente es X (60% de conversión)"
- "Concentras 70% en llamadas. Diversifica."
- "Solo 44% pasa de Negociación a Autorización."

### 14.4 Densidad funcional, no decorativa

Si un elemento no informa o no acciona, **fuera**. Cero ornamentos.

### 14.5 Animaciones funcionales

- Slide-up para entrada (jerarquía: lo importante primero).
- Pulse-dot para urgencia (rojo crítico).
- Check-pop para satisfacción (completar tarea).
- Stagger para ritmo visual.

NO animaciones gratis (rotaciones, parallax, etc.).

### 14.6 Tabular nums en todo número

Sin excepciones. Que se alineen verticalmente.

### 14.7 Hover lift en cards interactivas

Si una card es clickeable, levanta sutilmente al hover. Indica afordancia.

### 14.8 Detail panels, no modales

Cuando se necesita ver detalle de un item de una lista/tabla, **panel desde la derecha** para mantener contexto. NO modal centrado.

### 14.9 Empty states cálidos

Nunca "Sin resultados" seco. Siempre con icono + mensaje cálido + posible acción.

### 14.10 Coherencia entre pantallas

- Estructura: Hero → KPIs → Tabs → Filtros → Contenido.
- Tipografía: misma jerarquía siempre.
- Stagger: siempre slide-up + stagger-N.
- Detail panel: siempre desde la derecha, con header sticky.

---

## Apéndice: Configuración técnica

### Tailwind config (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        brand: {
          50: "#FEF2F2", 100: "#FEE2E2", 200: "#FECACA", 300: "#FCA5A5",
          400: "#F87171", 500: "#EF4444", 600: "#E30613", 700: "#C70511",
          800: "#A1040E", 900: "#7F030B",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#3B82F6",
        background: "#FFFFFF",
        surface: "#FAFAFA",
        border: "#E5E7EB",
        muted: "#F3F4F6",
        "text-primary": "#0A0A0A",
        "text-secondary": "#6B7280",
        "text-tertiary": "#9CA3AF",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: { lg: "12px", md: "10px", sm: "8px" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Variables CSS globales (`app/globals.css`)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 4%;
  --brand: 355 95% 46%;
  --brand-foreground: 0 0% 100%;
}
```

---

## Cierre

Este documento es la fuente de verdad del diseño visual del producto. Cualquier nueva pantalla o componente debe **respetar estas reglas** para mantener coherencia.

Si vas a crear algo nuevo, pregúntate:
1. ¿Usa los tokens de color correctos?
2. ¿La tipografía sigue la jerarquía documentada?
3. ¿Tiene animación de entrada slide-up + stagger?
4. ¿Tiene focus visible?
5. ¿Es accesible (aria-labels, contraste)?
6. ¿Cumple las 10 reglas de oro?

Si la respuesta es sí a todo, está dentro del sistema. Si no, ajustar antes de mergear.
