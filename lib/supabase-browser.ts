import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uprwmvrhgdqbylpxrcdq.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcndtdnJoZ2RxYnlscHhyY2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDY1OTAsImV4cCI6MjA5MjI4MjU5MH0.5xnzyDsv9Q0kb764XekbVP5n35yx9PWCYl0NvfCKxkk';

export function createSupabaseBrowser() {
  return createBrowserClient(url.trim(), key.trim());
}
