import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uprwmvrhgdqbylpxrcdq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcndtdnJoZ2RxYnlscHhyY2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDY1OTAsImV4cCI6MjA5MjI4MjU5MH0.5xnzyDsv9Q0kb764XekbVP5n35yx9PWCYl0NvfCKxkk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('tickets').select('*').order('timestamp', { ascending: false });
  console.log("Error:", error);
  // Also log if it's an object with keys
  if (error) {
    console.log("Error details:", JSON.stringify(error, null, 2));
  }
}
test();
