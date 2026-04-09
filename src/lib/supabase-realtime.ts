import { createClient } from "@supabase/supabase-js";

// Client minimo do Supabase — usado APENAS para Realtime subscriptions.
// Todas as queries de dados passam pelo Drizzle ORM (src/lib/db.ts).
export const supabaseRealtime = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);
