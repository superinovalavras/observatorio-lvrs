import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { supabaseServico } from "./supabase";

// Cliente com a sessão do usuário (cookies). Só autentica — leitura e escrita
// passam pelo servico(), depois de exigirAdmin().
export async function supabaseSessao() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Supabase não configurado.");
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Em Server Component não dá para gravar cookie; o proxy renova a sessão.
        }
      },
    },
  });
}

export function servico() {
  const sb = supabaseServico();
  if (!sb) throw new Error("Supabase (service_role) não configurado.");
  return sb;
}

export async function usuarioAtual(): Promise<User | null> {
  try {
    const { data } = await (await supabaseSessao()).auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function ehAdmin(userId: string) {
  const { data } = await servico().from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  return !!data;
}

/** Toda página e toda Server Action do painel começa por aqui. */
export async function exigirAdmin() {
  const u = await usuarioAtual();
  if (!u) redirect("/entrar");
  if (!(await ehAdmin(u.id))) redirect("/entrar?erro=sem-acesso");
  return u;
}
