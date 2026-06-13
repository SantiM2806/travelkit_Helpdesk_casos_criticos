import { createBrowserClient } from '@supabase/ssr';

export function createCasosCriticosClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'casos_criticos' } }
  );
}
