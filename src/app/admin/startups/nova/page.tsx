import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { servico } from "@/lib/server/sessao";
import type { Instituicao, Programa } from "@/lib/tipos";
import { FormStartup } from "@/components/admin/form-startup";
import { TituloAdmin } from "@/components/admin/ui";

export default async function NovaStartup() {
  const sb = servico();
  const [{ data: inst }, { data: prog }] = await Promise.all([
    sb.from("instituicoes").select("*").order("ordem"),
    sb.from("programas").select("*").eq("tipo", "projeto_lvrs").order("ordem"),
  ]);
  return (
    <div className="max-w-4xl">
      <Link href="/admin/startups" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-tinta">
        <ArrowLeft className="size-4" /> Startups
      </Link>
      <TituloAdmin titulo="Cadastrar startup" sub="Para startups que não responderam pelo formulário. Entra no ciclo atual." />
      <FormStartup
        inicial={{ ativa: true }}
        instituicoes={(inst as Instituicao[]) ?? []}
        projetos={(prog as Programa[]) ?? []}
        rotulo="Cadastrar"
      />
    </div>
  );
}
