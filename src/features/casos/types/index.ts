/* ══════════════════════════════════════════════════
   Casos Críticos — modelo de datos
   Seguimiento de casos críticos del operativo Travelkit.
══════════════════════════════════════════════════ */

export type Proveedor = 'WTA' | 'WMC';

export type Area = 'System' | 'Claims' | 'Calidad' | 'Reembolsos' | 'Comercial';

export type EstatusCaso =
  | 'Abierto'
  | 'En seguimiento'
  | 'Respuesta Proveedor'
  | 'Resuelto';

/** Una nota de seguimiento del caso (timeline). */
export interface SeguimientoNota {
  id:          string;
  autor:       string;
  texto:       string;
  timestamp:   string;  // ISO
}

/** Documento adjunto al caso. */
export interface DocumentoCaso {
  nombre: string;
  url:    string;
  path?:  string;  // ruta en el bucket (para borrar)
}

/** Tarea accionable del caso (distinta a una nota de seguimiento). */
export interface Tarea {
  id:               string;
  texto:            string;        // "Llamar a la central…"
  responsable:      string;        // a quién le toca
  fecha_limite:     string;        // ISO con fecha/hora
  depende_proveedor:boolean;       // true = esperamos respuesta del proveedor
  completada:       boolean;
  notificar:        boolean;       // enviar recordatorio por correo
  notificado:       boolean;       // ya se envió el recordatorio
  created_at:       string;
}

export interface CasoCritico {
  id:                string;          // uuid interno
  numero_caso:       string;          // 1655479-01
  proveedor:         Proveedor;       // WTA | WMC
  voucher:           string;          // TK-EHCLHE
  nombre_paciente:   string;
  pasaporte:         string;          // documento de identidad
  fecha_nacimiento:  string;          // YYYY-MM-DD
  area:              Area;            // System | Claims | Calidad | Reembolsos | Comercial
  estatus:           EstatusCaso;
  fecha_evento:      string;          // ISO con hora
  fecha_apertura:    string;          // YYYY-MM-DD
  origen_viaje:      string;          // ISO-2 país (CO, EC, MX…)
  pais_servicio:     string;          // ISO-2 país
  descripcion:       string;
  documentos:        DocumentoCaso[];
  seguimiento:       SeguimientoNota[];
  tareas:            Tarea[];
}

/* ── Filtros del listado ── */
export interface CasosFiltros {
  desde:           string;   // YYYY-MM-DD
  hasta:           string;
  numero_caso:     string;
  voucher:         string;
  nombre:          string;
  documento:       string;
  fecha_nacimiento:string;
  area:            Area | '';
  estatus:         EstatusCaso | '';
  proveedor:       Proveedor | '';
}

export const FILTROS_VACIOS: CasosFiltros = {
  desde: '', hasta: '', numero_caso: '', voucher: '', nombre: '',
  documento: '', fecha_nacimiento: '', area: '', estatus: '', proveedor: '',
};

export const PROVEEDORES: Proveedor[] = ['WTA', 'WMC'];

export const AREAS: Area[] = ['System', 'Claims', 'Calidad', 'Reembolsos', 'Comercial'];

export const ESTATUS: EstatusCaso[] = ['Abierto', 'En seguimiento', 'Respuesta Proveedor', 'Resuelto'];
