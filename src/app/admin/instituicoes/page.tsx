import { servico } from "@/lib/server/sessao";
import { excluirInstituicao, salvarInstituicao } from "@/lib/server/acoes";
import { Cadastro } from "@/components/admin/cadastro";
import { TituloAdmin } from "@/components/admin/ui";

export default async function Instituicoes() {
  const { data } = await servico().from("instituicoes").select("*").order("ordem");
  return (
    <div className="max-w-4xl">
      <TituloAdmin
        titulo="Instituições e ambientes de inovação"
        sub="Aparecem na aba Instituições do site e no campo “instituição de origem” de cada startup. Inativar tira do site sem apagar o vínculo."
      />
      <Cadastro
        itens={data ?? []}
        campoTitulo="nome"
        camposResumo={["sigla", "tipo"]}
        rotuloNovo="Adicionar instituição"
        salvar={salvarInstituicao}
        excluir={excluirInstituicao}
        campos={[
          { nome: "nome", rotulo: "Nome", largo: true },
          { nome: "sigla", rotulo: "Sigla ou nome curto" },
          {
            nome: "tipo",
            rotulo: "Tipo",
            tipo: "opcoes",
            opcoes: [
              { valor: "ies", rotulo: "Ensino superior" },
              { valor: "ambiente", rotulo: "Ambiente de inovação" },
            ],
          },
          { nome: "descricao", rotulo: "Descrição curta", tipo: "area" },
          { nome: "site", rotulo: "Site", tipo: "url" },
          { nome: "logo_url", rotulo: "Logo", tipo: "logo" },
          { nome: "ordem", rotulo: "Ordem", tipo: "numero" },
          { nome: "ativa", rotulo: "Ativa (aparece no site)", tipo: "marca" },
        ]}
      />
    </div>
  );
}
