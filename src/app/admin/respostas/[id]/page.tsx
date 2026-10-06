import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { servico } from "@/lib/server/sessao";
import { rejeitarResposta } from "@/lib/server/acoes";
import { normal, sugerir } from "@/lib/importacao";
import type { Instituicao, Programa, Resposta } from "@/lib/tipos";
import { FormStartup } from "@/components/admin/form-startup";
import { Aviso, CartaoAdmin, TituloAdmin, btnPerigo } from "@/components/admin/ui";

// Colunas com dado pessoal dos sócios e endereço: ficam recolhidas na revisão.
const pessoal = (c: string) => normal(c).startsWith("socio") || normal(c).includes("endereco") && normal(c).includes("rua");

export default async function RevisarResposta({ params }: PageProps<"/admin/respostas/[id]">) {
  const { id } = await params;
  const sb = servico();
  const [{ data: r }, { data: inst }, { data: prog }] = await Promise.all([
    sb.from("respostas").select("*").eq("id", id).maybeSingle(),
    sb.from("instituicoes").select("*").order("ordem"),
    sb.from("programas").select("*").eq("tipo", "projeto_lvrs").order("ordem"),
  ]);
  if (!r) notFound();
  const resposta = r as Resposta;
  const sugestao = sugerir(resposta.dados);
  const colunas = Object.entries(resposta.dados).filter(([, v]) => String(v).trim());

  return (
    <>
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-tinta">
        <ArrowLeft className="size-4" /> Respostas
      </Link>
      <TituloAdmin
        titulo={resposta.nome ?? "(sem nome)"}
        sub="À esquerda, a resposta como chegou do formulário. À direita, a codificação sugerida automaticamente: confira, corrija o que for preciso e aprove."
        acoes={
          resposta.status === "nova" && (
            <form action={rejeitarResposta.bind(null, resposta.id)}>
              <button className={btnPerigo}>
                <X className="size-4" /> Rejeitar
              </button>
            </form>
          )
        }
      />
      {resposta.status !== "nova" && (
        <div className="mb-5">
          <Aviso tom="atencao">Esta resposta já está {resposta.status}. Aprovar de novo cria outra startup.</Aviso>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <CartaoAdmin className="xl:sticky xl:top-6 xl:max-h-[calc(100svh-3rem)] xl:overflow-auto">
          <h2 className="font-display text-base font-semibold">Resposta original</h2>
          <dl className="mt-4 space-y-4 text-sm">
            {colunas
              .filter(([c]) => !pessoal(c))
              .map(([c, v]) => (
                <div key={c}>
                  <dt className="text-xs font-medium text-slate-500">{c}</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap leading-relaxed">{String(v)}</dd>
                </div>
              ))}
          </dl>
          {colunas.some(([c]) => pessoal(c)) && (
            <details className="mt-6 rounded-xl border border-papel-fio p-3 text-sm">
              <summary className="cursor-pointer text-xs font-medium text-slate-600">
                Dados pessoais dos sócios e endereço (sigilosos, só para contato institucional)
              </summary>
              <dl className="mt-3 space-y-3">
                {colunas
                  .filter(([c]) => pessoal(c))
                  .map(([c, v]) => (
                    <div key={c}>
                      <dt className="text-xs text-slate-500">{c}</dt>
                      <dd>{String(v)}</dd>
                    </div>
                  ))}
              </dl>
            </details>
          )}
        </CartaoAdmin>
        <FormStartup
          inicial={{ ...sugestao, ativa: true }}
          instituicoes={(inst as Instituicao[]) ?? []}
          projetos={(prog as Programa[]) ?? []}
          respostaId={resposta.id}
          rotulo="Aprovar e publicar nos números"
        />
      </div>
    </>
  );
}
