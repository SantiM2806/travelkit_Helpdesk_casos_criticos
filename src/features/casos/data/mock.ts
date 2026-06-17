import type { CasoCritico } from '@/features/casos/types';

/** Datos de ejemplo para validar el diseño sin Supabase. */
export const MOCK_CASOS: CasoCritico[] = [
  {
    id: 'c1', numero_caso: '1655479-01', proveedor: 'WTA', voucher: 'TK-EHCLHE',
    nombre_paciente: 'Alex Amerito Zarate', pasaporte: 'EC8842013', fecha_nacimiento: '1991-04-12',
    area: 'Claims', estatus: 'Abierto',
    fecha_evento: '2026-06-16T12:26:13', fecha_apertura: '2026-06-16',
    origen_viaje: 'EC', pais_servicio: 'CO',
    descripcion: 'Paciente reporta dolor dental agudo durante su estadía.',
    documentos: [], tareas: [], seguimiento: [
      { id: 's1', autor: 'Natalia Cardenas', texto: 'Caso recibido. Se orienta a clínica más cercana.', timestamp: '2026-06-16T12:30:00' },
    ],
  },
  {
    id: 'c2', numero_caso: '1655457-01', proveedor: 'WMC', voucher: 'TK-D07EFA',
    nombre_paciente: 'Gabriella Torralvo Moreno', pasaporte: 'CO1029384', fecha_nacimiento: '1988-11-03',
    area: 'Reembolsos', estatus: 'En seguimiento',
    fecha_evento: '2026-06-16T12:03:59', fecha_apertura: '2026-06-16',
    origen_viaje: 'CO', pais_servicio: 'DO',
    descripcion: 'Solicitud de reembolso por atención médica ambulatoria.',
    documentos: [], tareas: [], seguimiento: [],
  },
  {
    id: 'c3', numero_caso: '1655448-01', proveedor: 'WTA', voucher: '8985234202245447223',
    nombre_paciente: 'Luisa Fernanda Rincon Arango', pasaporte: 'MX5567120', fecha_nacimiento: '1995-07-22',
    area: 'System', estatus: 'Resuelto',
    fecha_evento: '2026-06-16T11:47:15', fecha_apertura: '2026-06-16',
    origen_viaje: 'MX', pais_servicio: 'MX',
    descripcion: 'E-sim sin conectividad de datos tras activación.',
    documentos: [], tareas: [], seguimiento: [],
  },
];
