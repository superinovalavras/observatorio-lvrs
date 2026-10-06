import Link from "next/link";
import { CheckCheck, RotateCcw } from "lucide-react";
import { servico } from "@/lib/server/sessao";
import { aprovarDireto, reabrirResposta } from "@/lib/server/acoes";
import type { Resposta } from "@/lib/tipos";
import { valorDe } from "@/lib/importacao";
import { CartaoAdmin, TituloAdmin, btnContorno } from "@/components/admin/ui";
import { Importador } from "./importador";

const quando = (t: string | null) => (t ? new Date(t).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—");

export default async function Respostas({ searchParams }: PageProps<"/admin">) {
  const { ver = "nova" } = await searchParams;
  const filtro = ["nova", "aprovada", "rejeitada"].includes(String(ver)) ? String(ver) : "nova";
  const sb = servico();
  const [{ data }, contagens] = await Promise.all([
    sb.from("respostas").select("*").eq("status", filtro).order("recebida_em", { ascending: false }).limit(500),
    Promise.all(
      ["nova", "aprovada", "rejeitada"].map(async (s) => {
        const { count } = await sb.from("respostas").select("id", { count: "exact", head: true }).eq("status", s);
        return [s, count ?? 0] as const;
      }),
    ),
  ]);
  const respostas = (data as Resposta[]) ?? [];
  const n = Object.fromEntries(contagens);

  return (
    <>
      <TituloAdmin
        titulo="Respostas do Censo"
        sub="As respostas chegam pela planilha do Google Form. Importe a planilha, revise cada resposta e aprove: só startups aprovadas entram nos números do site."
      />
      <Importador />

      <div className="mt-8 flex gap-1 border-b border-papel-fio">
        {[
          ["nova", "A revisar"],
          ["aprovada", "Aprovadas"],
          ["rejeitada", "Rejeitadas"],
        ].map(([id, rotulo]) => (
          <Link
            key={id}
            href={`/admin?ver=${id}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm ${filtro === id ? "border-fundo font-medium text-tinta" : "border-transparent text-slate-500 hover:text-tinta"}`}
          >
            {rotulo} <span className="ml-1 text-xs text-slate-400">{n[id]}</span>
          </Link>
        ))}
      </div>

      <CartaoAdmin className="mt-4 p-0 sm:p-0">
        {respostas.length ? (
          <ul className="divide-y divide-papel-fio">
            {respostas.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
                <div className="min-w-48 flex-1">
                  <p className="font-medium">{r.nome ?? "(sem nome)"}</p>
                  <p className="text-xs text-slate-500">
                    {valorDe(r.dados, "vertical") || "vertical não informada"} · {valorDe(r.dados, "fase") || "fase não informada"} ·
                    recebida {quando(r.recebida_em)} · ciclo {r.ciclo}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status === "nova" && (
                    <>
                      <Link href={`/admin/respostas/${r.id}`} className={btnContorno}>
                        Revisar e codificar
                      </Link>
                      <form action={aprovarDireto.bind(null, r.id)}>
                        <button className={btnContorno} title="Grava a codificação automática sem revisar">
                          <CheckCheck className="size-4" /> Aprovar
                        </button>
                      </form>
                    </>
                  )}
                  {r.status === "aprovada" && r.startup_id && (
                    <Link href={`/admin/startups/${r.startup_id}`} className={btnContorno}>
                      Ver startup
                    </Link>
                  )}
                  {r.status === "rejeitada" && (
                    <form action={reabrirResposta.bind(null, r.id)}>
                      <button className={btnContorno}>
                        <RotateCcw className="size-4" /> Voltar para revisão
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            {filtro === "nova" ? "Nada a revisar. Importe a planilha para trazer respostas novas." : "Nenhuma resposta aqui."}
          </p>
        )}
      </CartaoAdmin>
    </>
  );
}
