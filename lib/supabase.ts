import { createClient } from '@supabase/supabase-js';

// Usamos el fallback directamente en caso de que el entorno de desarrollo (Next.js) no haya
// sido reiniciado después de haber inyectado las nuevas variables en el archivo .env
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uprwmvrhgdqbylpxrcdq.supabase.co';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcndtdnJoZ2RxYnlscHhyY2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDY1OTAsImV4cCI6MjA5MjI4MjU5MH0.5xnzyDsv9Q0kb764XekbVP5n35yx9PWCYl0NvfCKxkk';

const supabaseUrl = rawUrl.trim();
const supabaseAnonKey = rawKey.trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);