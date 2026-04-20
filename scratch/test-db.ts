import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uprwmvrhgdqbylpxrcdq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcndtdnJoZ2RxYnlscHhyY2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDY1OTAsImV4cCI6MjA5MjI4MjU5MH0.5xnzyDsv9Q0kb764XekbVP5n35yx9PWCYl0NvfCKxkk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('tickets').select('*');
  console.log("Error:", error);
  console.log("Total rows:", data?.length);
  // Find any row with nulls in critical fields
  const badRows = data?.filter(t => !t.ticket_id || !t.email || !t.descripcion || !t.categoria || !t.prioridad);
  console.log("Bad rows:", badRows);
}
test();
