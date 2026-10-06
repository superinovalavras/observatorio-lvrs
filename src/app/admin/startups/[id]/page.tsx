import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { servico } from "@/lib/server/sessao";
import { excluirStartup } from "@/lib/server/acoes";
import type { Instituicao, Programa, Startup } from "@/lib/tipos";
import { FormStartup } from "@/components/admin/form-startup";
import { TituloAdmin } from "@/components/admin/ui";
import { Excluir } from "@/components/admin/cadastro";

export default async function EditarStartup({ params }: PageProps<"/admin/startups/[id]">) {
  const { id } = await params;
  const sb = servico();
  const [{ data: s }, { data: inst }, { data: prog }] = await Promise.all([
    sb.from("startups").select("*").eq("id", id).maybeSingle(),
    sb.from("instituicoes").select("*").order("ordem"),
    sb.from("programas").select("*").eq("tipo", "projeto_lvrs").order("ordem"),
  ]);
  if (!s) notFound();
  const startup = s as Startup;
  return (
    <div className="max-w-4xl">
      <Link href="/admin/startups" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-tinta">
        <ArrowLeft className="size-4" /> Startups
      </Link>
      <TituloAdmin
        titulo={startup.nome}
        sub={
          startup.resposta_id ? (
            <Link className="underline" href={`/admin/respostas/${startup.resposta_id}`}>
              Ver a resposta original do formulário
            </Link>
          ) : (
            "Cadastrada manualmente."
          )
        }
        acoes={
          <Excluir onExcluir={excluirStartup.bind(null, startup.id)} nome={startup.nome} />
        }
      />
      <FormStartup
        inicial={startup}
        instituicoes={(inst as Instituicao[]) ?? []}
        projetos={(prog as Programa[]) ?? []}
        rotulo="Salvar"
      />
    </div>
  );
}
