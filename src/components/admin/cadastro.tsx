"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import type { Resultado } from "@/lib/server/acoes";
import { Campo, CampoLogo, CartaoAdmin, Formulario, btnContorno, btnPerigo, inputCls } from "./ui";

export type CampoCadastro =
  | { nome: string; rotulo: string; tipo?: "texto" | "numero" | "url"; largo?: boolean; ajuda?: string }
  | { nome: string; rotulo: string; tipo: "area"; largo?: boolean; ajuda?: string }
  | { nome: string; rotulo: string; tipo: "marca"; ajuda?: string }
  | { nome: string; rotulo: string; tipo: "logo"; ajuda?: string }
  | { nome: string; rotulo: string; tipo: "opcoes"; opcoes: { valor: string; rotulo: string }[]; ajuda?: string };

type Linha = { id: string } & Record<string, unknown>;

/**
 * Lista editável genérica (instituições, programas, indicadores): cada item abre
 * num formulário próprio; "Adicionar" abre um formulário vazio no topo.
 */
export function Cadastro({
  itens,
  campos,
  campoTitulo,
  camposResumo = [],
  salvar,
  excluir,
  rotuloNovo,
}: {
  itens: Linha[];
  campos: CampoCadastro[];
  /** Nomes de campo (e não funções: este componente recebe props do servidor). */
  campoTitulo: string;
  camposResumo?: string[];
  salvar: (r: Resultado, fd: FormData) => Promise<Resultado>;
  excluir: (id: string) => Promise<void>;
  rotuloNovo: string;
}) {
  const [aberto, setAberto] = useState<string | null>(null);
  const titulo = (l: Linha) => String(l[campoTitulo] ?? "");
  const resumo = (l: Linha) =>
    camposResumo
      .map((c) => l[c])
      .filter((x) => x != null && x !== "")
      .join(" · ");
  return (
    <div className="space-y-3">
      {aberto === "novo" ? (
        <CartaoAdmin>
          <p className="mb-4 font-display font-semibold">{rotuloNovo}</p>
          <Formulario
            acao={async (r, fd) => {
              const res = await salvar(r, fd);
              if (res?.ok) setAberto(null);
              return res;
            }}
            rotulo="Adicionar"
          >
            <Campos campos={campos} />
          </Formulario>
        </CartaoAdmin>
      ) : (
        <button className={btnContorno} onClick={() => setAberto("novo")}>
          <Plus className="size-4" /> {rotuloNovo}
        </button>
      )}

      <CartaoAdmin className="p-0 sm:p-0">
        <ul className="divide-y divide-papel-fio">
          {itens.map((l) => (
            <li key={l.id}>
              <button
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-papel"
                onClick={() => setAberto(aberto === l.id ? null : l.id)}
                aria-expanded={aberto === l.id}
              >
                {"logo_url" in l && (
                  <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-papel-fio bg-white">
                    {l.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(l.logo_url)} alt="" className="max-h-full max-w-full object-contain p-0.5" />
                    ) : null}
                  </span>
                )}
                <span className="flex-1">
                  <span className="font-medium">{titulo(l)}</span>
                  {resumo(l) && <span className="block text-xs text-slate-500">{resumo(l)}</span>}
                </span>
                {(l.ativa === false || l.ativo === false) && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">inativo</span>}
                <ChevronDown className={`size-4 text-slate-400 transition-transform ${aberto === l.id ? "rotate-180" : ""}`} />
              </button>
              {aberto === l.id && (
                <div className="border-t border-papel-fio bg-papel/60 px-5 py-5">
                  <Formulario acao={salvar}>
                    <input type="hidden" name="id" value={l.id} />
                    <Campos campos={campos} valores={l} />
                  </Formulario>
                  <Excluir onExcluir={() => excluir(l.id)} nome={titulo(l)} />
                </div>
              )}
            </li>
          ))}
          {!itens.length && <li className="px-5 py-8 text-center text-sm text-slate-500">Nada cadastrado.</li>}
        </ul>
      </CartaoAdmin>
    </div>
  );
}

function Campos({ campos, valores = {} }: { campos: CampoCadastro[]; valores?: Record<string, unknown> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {campos.map((c) => {
        const v = valores[c.nome];
        if (c.tipo === "logo")
          return (
            <div key={c.nome} className="sm:col-span-2">
              <p className="mb-1.5 text-[13px] font-medium text-tinta">{c.rotulo}</p>
              <CampoLogo atual={(v as string | null) ?? null} nome={String(valores.nome ?? "")} />
            </div>
          );
        if (c.tipo === "marca")
          return (
            <label key={c.nome} className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" name={c.nome} defaultChecked={v === undefined ? true : !!v} className="size-4 accent-[#0a2540]" />
              {c.rotulo}
            </label>
          );
        if (c.tipo === "opcoes")
          return (
            <Campo key={c.nome} rotulo={c.rotulo} ajuda={c.ajuda}>
              <select name={c.nome} defaultValue={String(v ?? c.opcoes[0].valor)} className={inputCls}>
                {c.opcoes.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </option>
                ))}
              </select>
            </Campo>
          );
        return (
          <Campo key={c.nome} rotulo={c.rotulo} ajuda={c.ajuda} className={c.largo || c.tipo === "area" ? "sm:col-span-2" : ""}>
            {c.tipo === "area" ? (
              <textarea name={c.nome} rows={2} defaultValue={String(v ?? "")} className={inputCls} />
            ) : (
              <input
                name={c.nome}
                type={c.tipo === "numero" ? "number" : c.tipo === "url" ? "url" : "text"}
                defaultValue={v == null ? "" : String(v)}
                className={inputCls}
              />
            )}
          </Campo>
        );
      })}
    </div>
  );
}

/** Exclusão pede confirmação: some do site na hora e não tem desfazer. */
export function Excluir({ onExcluir, nome }: { onExcluir: () => Promise<void>; nome: string }) {
  const [pendente, iniciar] = useTransition();
  return (
    <button
      type="button"
      className={`${btnPerigo} mt-4 h-9`}
      disabled={pendente}
      onClick={() => {
        if (confirm(`Excluir “${nome}”? Não dá para desfazer.`)) iniciar(() => onExcluir());
      }}
    >
      {pendente ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Excluir
    </button>
  );
}
