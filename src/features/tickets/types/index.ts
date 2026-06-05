export interface Ticket {
  id:            string;          // UUID, siempre presente (PK de public.tickets)
  ticket_id?:    string | null;   // codigo humano legacy TK-0001, puede ser NULL para tickets nuevos
  codigo?:       string | null;   // codigo humano nuevo TKT-00001 / SOL-00001 (auto-generado por trigger)
  tipo?:         string | null;   // 'interna_proyecto' | 'externa_soporte'
  timestamp:     string;
  email?:        string | null;
  categoria?:    string | null;
  prioridad:     string;
  descripcion:   string;
  estado:        string;
  responsable:   string | null;
  area?:         string | null;
  imagen_url?:   string | null;
  // Campos del nuevo formulario de solicitud
  full_name?:    string | null;
  department?:   string | null;
  main_category?: string | null;
  sub_category?: string | null;
  request_type?: string | null;
  urgency?:      string | null;
  subject?:      string | null;
  description?:  string | null;
  attachment_url?: string | null;
}

export type EstadoFilter    = 'Todos' | 'Abierto' | 'En proceso' | 'Resuelto' | 'Otra área';
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
