export interface Ticket {
  id:              string;          // UUID, PK de public.tickets
  ticket_id?:      string | null;   // codigo humano TKCC-0001
  codigo?:         string | null;
  tipo?:           string | null;
  timestamp:       string;
  email?:          string | null;
  // Campos de casos críticos
  cliente?:        string | null;   // Nombre del cliente
  agencia?:        string | null;   // Nombre de la agencia
  tipo_solicitud?: string | null;   // Comercial | Sistem | Claims | Gestion de planes | Calidad
  prioridad:       string;
  descripcion:     string;
  estado:          string;
  responsable:     string | null;
  area?:           string | null;
  imagen_url?:     string | null;
  // Campos legacy / formulario público
  categoria?:      string | null;
  full_name?:      string | null;
  department?:     string | null;
  main_category?:  string | null;
  sub_category?:   string | null;
  request_type?:   string | null;
  urgency?:        string | null;
  subject?:        string | null;
  description?:    string | null;
  attachment_url?: string | null;
}

export type EstadoFilter    = 'Todos' | 'Abierto' | 'En gestion del proveedor' | 'Información cliente' | 'Finalizado';
export type PrioridadFilter = 'Todas' | 'Alta' | 'Media' | 'Baja';
export type View  = 'table' | 'kanban';
export type Theme = 'dark'  | 'light';

export interface PendingMove {
  ticketId:   string;
  fromEstado: string;
  toEstado:   string;
}

export interface ToastItem {
  id:     string;
  html:   string;
  hiding: boolean;
}

export interface MovementLog {
  ticket_id:   string;
  de:          string;
  a:           string;
  responsable: string;
  area:        string | null;
  accion:      string;
  timestamp:   string;
}
