import type { Ticket } from '../types';

function daysAgo(d: number, h: number, m: number): string {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, m, 0, 0);
  return t.toISOString();
}

const MOCK_SEED: Omit<Ticket, 'id'>[] = [
  { ticket_id:'TK-0001', timestamp: daysAgo(0,8,14),  email:'m.torres@travelkit.us',   categoria:'Conectividad', prioridad:'Alta',  descripcion:'No puedo conectarme al VPN desde casa, error 800.',                 estado:'Abierto',    responsable: null },
  { ticket_id:'TK-0002', timestamp: daysAgo(0,9,32),  email:'c.ramirez@travelkit.us',  categoria:'Software',     prioridad:'Alta',  descripcion:'Outlook no abre, cierra solo al iniciar. Reinstalé y persiste.',    estado:'Abierto',    responsable: null },
  { ticket_id:'TK-0003', timestamp: daysAgo(1,10,5),  email:'l.perez@travelkit.us',    categoria:'Accesos',      prioridad:'Alta',  descripcion:'Bloqueado del sistema de reservas tras cambio de contraseña.',      estado:'Abierto',    responsable: null },
  { ticket_id:'TK-0004', timestamp: daysAgo(1,11,48), email:'a.gomez@travelkit.us',    categoria:'Hardware',     prioridad:'Alta',  descripcion:'Laptop no enciende, hizo un chasquido y se apagó sola.',            estado:'Abierto',    responsable: null },
  { ticket_id:'TK-0005', timestamp: daysAgo(1,14,20), email:'s.moreno@travelkit.us',   categoria:'Teams',        prioridad:'Media', descripcion:'No puedo compartir pantalla en Teams, botón aparece bloqueado.',    estado:'Abierto',    responsable: null },
  { ticket_id:'TK-0006', timestamp: daysAgo(2,8,55),  email:'d.vargas@travelkit.us',   categoria:'Correo',       prioridad:'Alta',  descripcion:'Recibo correos pero no puedo enviar desde el dominio corporativo.',  estado:'En proceso', responsable: null },
  { ticket_id:'TK-0007', timestamp: daysAgo(2,9,10),  email:'p.castillo@travelkit.us', categoria:'Hardware',     prioridad:'Media', descripcion:'Pantalla del portátil parpadea cada 5 minutos, imposible trabajar.', estado:'En proceso', responsable: null },
  { ticket_id:'TK-0008', timestamp: daysAgo(2,15,30), email:'n.herrera@travelkit.us',  categoria:'Accesos',      prioridad:'Media', descripcion:'Necesito acceso al módulo de facturación para el nuevo proyecto.',   estado:'En proceso', responsable: null },
  { ticket_id:'TK-0009', timestamp: daysAgo(3,10,0),  email:'r.diaz@travelkit.us',     categoria:'Conectividad', prioridad:'Media', descripcion:'WiFi de la oficina 3 cae cada hora, afecta a todo el piso.',         estado:'En proceso', responsable: null },
  { ticket_id:'TK-0010', timestamp: daysAgo(3,11,25), email:'v.mendoza@travelkit.us',  categoria:'Software',     prioridad:'Baja',  descripcion:'Adobe Reader no imprime en PDF, error de impresora virtual.',        estado:'En proceso', responsable: null },
  { ticket_id:'TK-0011', timestamp: daysAgo(3,16,40), email:'j.ruiz@travelkit.us',     categoria:'Teams',        prioridad:'Baja',  descripcion:'Solicitud de licencia Teams para usuario nuevo: k.salinas.',         estado:'En proceso', responsable: null },
  { ticket_id:'TK-0012', timestamp: daysAgo(4,8,30),  email:'k.salinas@travelkit.us',  categoria:'Conectividad', prioridad:'Alta',  descripcion:'VPN caída para toda la sede Bogotá, 12 usuarios afectados.',         estado:'Resuelto',   responsable: null },
  { ticket_id:'TK-0013', timestamp: daysAgo(4,10,15), email:'f.ortiz@travelkit.us',    categoria:'Hardware',     prioridad:'Media', descripcion:'Teclado inalámbrico sin respuesta tras actualización de drivers.',    estado:'Resuelto',   responsable: null },
  { ticket_id:'TK-0014', timestamp: daysAgo(5,9,0),   email:'e.silva@travelkit.us',    categoria:'Software',     prioridad:'Baja',  descripcion:'Excel se cierra al abrir archivos mayores a 10 MB.',                 estado:'Resuelto',   responsable: null },
  { ticket_id:'TK-0015', timestamp: daysAgo(5,11,50), email:'b.aguilar@travelkit.us',  categoria:'Correo',       prioridad:'Baja',  descripcion:'Firma corporativa desapareció tras actualización de Outlook.',        estado:'Resuelto',   responsable: null },
  { ticket_id:'TK-0016', timestamp: daysAgo(5,14,5),  email:'i.reyes@travelkit.us',    categoria:'Accesos',      prioridad:'Media', descripcion:'Sin acceso al repositorio de documentos compartido en SharePoint.',   estado:'Resuelto',   responsable: null },
  { ticket_id:'TK-0017', timestamp: daysAgo(6,8,45),  email:'o.leon@travelkit.us',     categoria:'Teams',        prioridad:'Baja',  descripcion:'Canal de Teams de operaciones no aparece en el listado del equipo.', estado:'Resuelto',   responsable: null },
  { ticket_id:'TK-0018', timestamp: daysAgo(7,10,30), email:'m.torres@travelkit.us',   categoria:'Hardware',     prioridad:'Baja',  descripcion:'Mouse USB sin respuesta, funciona en otro equipo (posible puerto).',  estado:'Resuelto',   responsable: null },
];

// Cada mock recibe un id sintético (la PK real viene de Supabase).
export const MOCK_DATA: Ticket[] = MOCK_SEED.map((t, i) => ({
  id: `mock-${String(i + 1).padStart(4, '0')}`,
  ...t,
}));
