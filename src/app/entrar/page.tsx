import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { supabaseConfigurado } from "@/lib/server/supabase";
import { FormEntrar } from "./form";

export const metadata: Metadata = { title: "Acesso da equipe", robots: { index: false } };

export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const { erro } = await searchParams;
  return (
    <div className="grid min-h-svh place-items-center bg-fundo px-4 py-10">
      <div className="malha pointer-events-none fixed inset-x-0 top-0 h-80" aria-hidden />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mx-auto mb-8 block w-fit">
          <Image src="/assets/logo.png" alt="Observatório VDI" width={760} height={521} className="h-16 w-auto" priority />
        </Link>
        <div className="rounded-2xl bg-white p-7 text-tinta">
          <h1 className="font-display text-xl font-semibold">Painel do Observatório</h1>
          <p className="mt-1 text-sm text-slate-600">Acesso restrito à equipe da Superintendência.</p>
          {!supabaseConfigurado() ? (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              O banco de dados ainda não está configurado. Veja o <b>README</b> do repositório: criar o projeto no Supabase,
              rodar a migração e preencher o <code>.env.local</code>.
            </p>
          ) : (
            <FormEntrar erroInicial={erro === "sem-acesso" ? "Esta conta não tem acesso ao painel." : undefined} />
          )}
        </div>
      </div>
    </div>
  );
}
