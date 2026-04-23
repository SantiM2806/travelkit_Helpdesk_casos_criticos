export interface Ticket {
  ticket_id: string;
  timestamp: string;
  email: string;
  categoria: string;
  prioridad: string;
  descripcion: string;
  estado: string;
  responsable: string | null;
  area?: string;
  imagen_url?: string | null;
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