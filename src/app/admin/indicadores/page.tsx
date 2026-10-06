import { servico } from "@/lib/server/sessao";
import { excluirIndicador, salvarIndicador } from "@/lib/server/acoes";
import { Cadastro } from "@/components/admin/cadastro";
import { TituloAdmin } from "@/components/admin/ui";

export default async function Indicadores() {
  const { data } = await servico().from("indicadores").select("*").order("ordem");
  return (
    <div className="max-w-4xl">
      <TituloAdmin
        titulo="Lavras em números"
        sub="Indicadores macro da cidade, de fontes públicas, na aba Panorama. Os marcados como destaque viram cartões; os demais entram na tabela. Sempre informe ano e fonte."
      />
      <Cadastro
        itens={data ?? []}
        campoTitulo="rotulo"
        camposResumo={["valor", "ano", "fonte"]}
        rotuloNovo="Adicionar indicador"
        salvar={salvarIndicador}
        excluir={excluirIndicador}
        campos={[
          { nome: "valor", rotulo: "Valor (como deve aparecer)", ajuda: "Ex.: 111.437 · R$ 3,92 bi · 62,72%" },
          { nome: "rotulo", rotulo: "Rótulo", ajuda: "Ex.: Habitantes" },
          { nome: "detalhe", rotulo: "Detalhe", ajuda: "Linha pequena abaixo, opcional" },
          { nome: "ano", rotulo: "Ano de referência" },
          { nome: "fonte", rotulo: "Fonte", largo: true },
          { nome: "ordem", rotulo: "Ordem", tipo: "numero" },
          { nome: "destaque", rotulo: "Destaque (cartão grande)", tipo: "marca" },
        ]}
      />
    </div>
  );
}
