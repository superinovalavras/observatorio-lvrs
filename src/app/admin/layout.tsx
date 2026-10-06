import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { exigirAdmin, servico } from "@/lib/server/sessao";
import { supabaseConfigurado } from "@/lib/server/supabase";
import { sair } from "@/lib/server/acoes";
import { NavAdmin } from "./nav";

// Painel: sempre por requisição, com a sessão de quem está logado.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  if (!supabaseConfigurado()) redirect("/entrar");
  const admin = await exigirAdmin();
  const { count } = await servico().from("respostas").select("id", { count: "exact", head: true }).eq("status", "nova");

  return (
    <div className="grid min-h-svh bg-papel text-tinta lg:grid-cols-[240px_1fr]">
      <aside className="bg-fundo px-3 py-5 text-corpo lg:sticky lg:top-0 lg:h-svh lg:overflow-auto">
        <Link href="/admin" className="mb-5 flex items-center gap-3 border-b border-fio px-2 pb-5">
          <Image src="/assets/logo.png" alt="Observatório VDI" width={760} height={521} className="h-9 w-auto" />
          <span className="text-[10px] font-medium uppercase leading-snug tracking-[0.18em] text-fraco">Painel</span>
        </Link>
        <NavAdmin novas={count ?? 0} />
        <div className="mt-6 space-y-2 border-t border-fio px-2.5 pt-4 text-xs">
          <p className="truncate text-fraco" title={admin.email}>{admin.email}</p>
          <a href="/" target="_blank" className="flex items-center gap-1.5 hover:text-verde">
            <ExternalLink className="size-3.5" /> Ver o site
          </a>
          <form action={sair}>
            <button className="flex items-center gap-1.5 hover:text-verde">
              <LogOut className="size-3.5" /> Sair
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-10 sm:pb-20">{children}</main>
    </div>
  );
}
