"use client";

import { useActionState, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { Resultado } from "@/lib/server/acoes";

export const inputCls =
  "w-full rounded-xl border border-papel-fio bg-white px-3 py-2.5 text-sm text-tinta outline-none focus:border-fundo focus:ring-2 focus:ring-fundo/15";
export const btnPrim =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-fundo px-5 text-sm font-medium text-white hover:bg-fundo-2 disabled:opacity-60";
export const btnVerde =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-verde px-5 text-sm font-semibold text-tinta hover:brightness-95 disabled:opacity-60";
export const btnContorno =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-papel-fio bg-white px-4 text-sm font-medium text-tinta hover:border-fundo/40";
export const btnPerigo =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50";

export function Campo({ rotulo, ajuda, children, className = "" }: { rotulo: string; ajuda?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-tinta">{rotulo}</span>
      {children}
      {ajuda && <span className="mt-1 block text-xs text-slate-500">{ajuda}</span>}
    </label>
  );
}

export function Aviso({ tom = "info", children }: { tom?: "info" | "erro" | "ok" | "atencao"; children: ReactNode }) {
  const cor = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    erro: "border-red-200 bg-red-50 text-red-800",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-900",
    atencao: "border-amber-200 bg-amber-50 text-amber-900",
  }[tom];
  return <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${cor}`}>{children}</div>;
}

export function CartaoAdmin({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-papel-fio bg-white p-5 sm:p-6 ${className}`}>{children}</div>;
}

/** Formulário com Server Action, estado de envio e mensagem de retorno. */
export function Formulario({
  acao,
  children,
  rotulo = "Salvar",
  className = "",
  botao,
}: {
  acao: (r: Resultado, fd: FormData) => Promise<Resultado>;
  children: ReactNode;
  rotulo?: string;
  className?: string;
  botao?: string;
}) {
  const [estado, enviar, pendente] = useActionState(acao, undefined);
  return (
    <form action={enviar} className={className}>
      {children}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className={botao ?? btnPrim} disabled={pendente}>
          {pendente && <Loader2 className="size-4 animate-spin" />} {rotulo}
        </button>
        {estado && !estado.ok && <span className="text-sm text-red-700">{estado.erro}</span>}
        {estado?.ok && estado.msg && <span className="text-sm text-emerald-700">{estado.msg}</span>}
      </div>
    </form>
  );
}

export function TituloAdmin({ titulo, sub, acoes }: { titulo: string; sub?: ReactNode; acoes?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-tinta">{titulo}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{sub}</p>}
      </div>
      {acoes}
    </div>
  );
}

/** Logo: mostra a atual, prévia do arquivo escolhido e opção de remover. PNG/JPG/WEBP até 1 MB. */
export function CampoLogo({ atual, nome }: { atual?: string | null; nome?: string }) {
  const [previa, setPrevia] = useState<string | null>(null);
  const [remover, setRemover] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const mostrar = remover ? null : (previa ?? atual ?? null);
  return (
    <div className="flex items-center gap-4">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-papel-fio bg-white">
        {mostrar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mostrar} alt={nome ? `Logo de ${nome}` : "Logo"} className="max-h-full max-w-full object-contain p-1.5" />
        ) : (
          <span className="text-[11px] text-slate-400">sem logo</span>
        )}
      </div>
      <div className="space-y-1.5 text-sm">
        <label className={`${btnContorno} h-9 cursor-pointer`}>
          {atual || previa ? "Trocar logo" : "Enviar logo"}
          <input
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setErro(null);
              if (!f) return setPrevia(null);
              if (f.size > 1_048_576) {
                setErro("Arquivo com mais de 1 MB. Reduza a imagem.");
                e.target.value = "";
                return setPrevia(null);
              }
              setRemover(false);
              setPrevia(URL.createObjectURL(f));
            }}
          />
        </label>
        {atual && (
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" name="remover_logo" checked={remover} onChange={(e) => setRemover(e.target.checked)} className="size-3.5 accent-[#0a2540]" />
            Remover logo
          </label>
        )}
        <p className="text-xs text-slate-500">{erro ?? "PNG, JPG ou WEBP, até 1 MB. Fundo transparente fica melhor."}</p>
      </div>
    </div>
  );
}
