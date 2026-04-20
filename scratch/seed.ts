import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uprwmvrhgdqbylpxrcdq.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcndtdnJoZ2RxYnlscHhyY2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcwNjU5MCwiZXhwIjoyMDkyMjgyNTkwfQ.EP8DBeHPC6SaAyg8XkrAJHP2JFHWWNCfbCE2mTP6mtM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  const tests = [
    { ticket_id: 'TK-PRUEBA-1', timestamp: new Date().toISOString(), email: 'prueba1@empresa.com', categoria: 'Software', prioridad: 'Alta', descripcion: 'El sistema principal no carga tras la actualización de anoche.', estado: 'Abierto', responsable: null },
    { ticket_id: 'TK-PRUEBA-2', timestamp: new Date().toISOString(), email: 'prueba2@empresa.com', categoria: 'Hardware', prioridad: 'Media', descripcion: 'El monitor del puesto 10 se ve con líneas rosas.', estado: 'En proceso', responsable: 'M. Torres' },
    { ticket_id: 'TK-PRUEBA-3', timestamp: new Date().toISOString(), email: 'prueba3@empresa.com', categoria: 'Accesos', prioridad: 'Baja', descripcion: 'No me acuerdo de mi contraseña para la intranet.', estado: 'Resuelto', responsable: 'Admin' }
  ];

  const { data, error } = await supabase.from('tickets').insert(tests).select();
  if (error) {
    console.error("Error al insertar pruebas:", error);
  } else {
    console.log("3 Registros insertados con éxito:", data);
  }
}
seed();
