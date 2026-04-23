import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvqxqyzeqxyqrtlgphnx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cXhxeXplcXh5cXJ0bGdwaG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY4MzgxMCwiZXhwIjoyMDkyMjU5ODEwfQ.EQ6p1F_VXjhaFIyOubqGW-xOdt8AP_eCrnYx9kWA5_c';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function createTables() {
  console.log('Creating table: tickets');
  const { error: err1 } = await supabase.from('tickets').upsert({
    ticket_id: 'TEST-001',
    timestamp: new Date().toISOString(),
    email: 'test@test.com',
    categoria: 'Software',
    prioridad: 'Baja',
    descripcion: 'Test ticket',
    estado: 'Abierto'
  }, { onConflict: 'ticket_id' });
  console.log(err1 ? 'Error: ' + err1.message : '✓ Table tickets created');

  console.log('Creating table: categorias_it');
  const { error: err2 } = await supabase.from('categorias_it').upsert({
    id: 1,
    nombre: 'Software',
    descripcion: 'Problemas de software'
  });
  console.log(err2 ? 'Error: ' + err2.message : '✓ Table categorias_it created');

  console.log('Creating table: solicitudes_it');
  const { error: err3 } = await supabase.from('solicitudes_it').upsert({
    id: '00000000-0000-0000-0000-000000000001',
    titulo: 'Test',
    descripcion: 'Test solicitud',
    solicitante_email: 'test@test.com',
    estado: 'Nuevo',
    prioridad: 'Media'
  });
  console.log(err3 ? 'Error: ' + err3.message : '✓ Table solicitudes_it created');

  console.log('\nVerifying tables...');
  try {
    const { error } = await supabase.from('tickets').select('ticket_id').limit(1);
    if (!error) console.log('✓ Table tickets verified');
  } catch (e: any) {
    console.log('tickets:', e.message);
  }
  try {
    const { error } = await supabase.from('categorias_it').select('id').limit(1);
    if (!error) console.log('✓ Table categorias_it verified');
  } catch (e: any) {
    console.log('categorias_it:', e.message);
  }
  try {
    const { error } = await supabase.from('solicitudes_it').select('id').limit(1);
    if (!error) console.log('✓ Table solicitudes_it verified');
  } catch (e: any) {
    console.log('solicitudes_it:', e.message);
  }
}

createTables();