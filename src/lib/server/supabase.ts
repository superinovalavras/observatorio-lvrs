import "server-only";
import { createClient } from "@supabase/supabase-js";

// Chave service_role: só no servidor, depois da checagem de permissão.
// Nunca importar em componente cliente.
export function supabaseServico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const supabaseConfigurado = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.SUPABASE_SECRET_KEY);
