import { servico } from "@/lib/server/sessao";
import { excluirPrograma, salvarPrograma } from "@/lib/server/acoes";
import { Cadastro } from "@/components/admin/cadastro";
import { Aviso, TituloAdmin } from "@/components/admin/ui";

export default async function Programas() {
  const { data } = await servico().from("programas").select("*").order("ordem");
  return (
    <div className="max-w-4xl">
      <TituloAdmin
        titulo="Programas, projetos, editais e incentivos"
        sub="Tudo o que aparece na aba Programas do site. Os Projetos Prioritários do LVRS+ também são as opções que cada startup marca na revisão."
      />
      <div className="mb-5">
        <Aviso tom="atencao">
          Não exclua um projeto do LVRS+ que já tem startups marcadas: o vínculo delas some dos gráficos. Para tirar do site,
          desmarque “Ativo”.
        </Aviso>
      </div>
      <Cadastro
        itens={data ?? []}
        campoTitulo="nome"
        camposResumo={["tipo", "descricao"]}
        rotuloNovo="Adicionar programa, edital ou incentivo"
        salvar={salvarPrograma}
        excluir={excluirPrograma}
        campos={[
          { nome: "nome", rotulo: "Nome", largo: true },
          {
            nome: "tipo",
            rotulo: "Tipo",
            tipo: "opcoes",
            opcoes: [
              { valor: "programa", rotulo: "Programa" },
              { valor: "edital", rotulo: "Edital" },
              { valor: "incentivo", rotulo: "Incentivo" },
              { valor: "projeto_lvrs", rotulo: "Projeto prioritário LVRS+" },
            ],
          },
          { nome: "link", rotulo: "Link", tipo: "url" },
          { nome: "descricao", rotulo: "Descrição curta", tipo: "area" },
          { nome: "logo_url", rotulo: "Logo", tipo: "logo" },
          { nome: "ordem", rotulo: "Ordem", tipo: "numero" },
          { nome: "ativo", rotulo: "Ativo (aparece no site)", tipo: "marca" },
        ]}
      />
    </div>
  );
}
