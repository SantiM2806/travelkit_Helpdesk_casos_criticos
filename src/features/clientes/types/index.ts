export type TipoCliente    = 'AGV Mayorista' | 'AGV Minorista' | 'Comparadora' | 'E-commerce';
export type Integrador     = 'Garlan' | 'Cacao' | 'Legacy';
export type EstadoCliente  = 'Activa' | 'Inactiva' | 'En Desarrollo';
export type OrigenIntegracion = 'Directo' | 'Consolidador';
export type TipoActividad  = 'Nota' | 'Llamada' | 'Email' | 'Reunión' | 'Ticket';

export interface Cliente {
  id: string;
  nombre: string;
  empresa: string | null;
  tipo_cliente: TipoCliente | null;
  integrador: Integrador | null;
  estado: EstadoCliente;
  origen_integracion: OrigenIntegracion | null;
  consolidador: string | null;
  responsable: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClienteActividad {
  id: string;
  cliente_id: string;
  tipo: TipoActividad;
  descripcion: string;
  responsable: string | null;
  created_at: string;
}
