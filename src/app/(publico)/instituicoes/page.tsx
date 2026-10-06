import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { AguardandoCiclo, Barras, Cartao, ConviteCenso, Pagina, Secao, TopoAba } from "@/components/ui";
import { distribuir } from "@/lib/agregados";
import { ORIGENS } from "@/lib/censo";
import { carregarBase } from "@/lib/server/dados";
import type { Instituicao } from "@/lib/tipos";

export const metadata: Metadata = { title: "Instituições e ambientes de inovação" };

export default async function Instituicoes() {
  const { parametros: p, startups, instituicoes, respostasRecebidas } = await carregarBase();
  const k = p.min_grupo;
  const ies = instituicoes.filter((i) => i.tipo === "ies");
  const ambientes = instituicoes.filter((i) => i.tipo === "ambiente");
  const nomeInst = (id: string) => {
    const i = instituicoes.find((x) => x.id === id);
    return i?.sigla ?? i?.nome ?? id;
  };

  const origens = distribuir(startups, ORIGENS, (s) => s.origem, k);
  const vinculos = distribuir(startups, instituicoes.map((i) => i.id), (s) => s.instituicao_id, k).filter((f) => f.n > 0);

  return (
    <Pagina>
      <TopoAba
        elemento="hachura"
        rotulo="Instituições e ambientes de inovação"
        titulo={
          <>
            Onde nascem as startups e os <em>talentos</em> de Lavras.
          </>
        }
        intro="Universidades, faculdades e ambientes de inovação que formam gente e sustentam o ecossistema. Lavras tem 14.735 matrículas de graduação: um em cada oito moradores."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Grupo titulo="Ensino superior" lista={ies} />
        <Grupo titulo="Ambientes de inovação" lista={ambientes} />
      </div>

      {p.ciclo_publicado ? (
        <div className="grid gap-x-8 lg:grid-cols-2">
          <Secao titulo="Como as startups surgiram" sub="Origem declarada no Censo. Spin-offs acadêmicas medem o quanto a pesquisa local vira empresa.">
            <Cartao>
              <Barras
                fatias={origens}
                k={k}
                rotulo={(r) => r.replace(" (UFLA/IES local)", "").replace(" (nasceu dentro de uma empresa)", "")}
              />
            </Cartao>
          </Secao>
          <Secao titulo="Startups ligadas a cada instituição" sub="Instituição de origem dos fundadores ou da tecnologia, registrada na revisão de cada resposta.">
            <Cartao>
              {vinculos.length ? (
                <Barras fatias={vinculos} k={k} rotulo={nomeInst} />
              ) : (
                <p className="text-sm text-fraco">Nenhum vínculo registrado neste ciclo.</p>
              )}
            </Cartao>
          </Secao>
        </div>
      ) : (
        <div className="mt-14">
          <AguardandoCiclo
            ciclo={p.ciclo_atual}
            respostas={respostasRecebidas}
            link={p.link_formulario}
            oQueVaiAparecer={[
              "Quantas startups são spin-offs acadêmicas",
              "Startups ligadas a cada instituição",
              "Origem: ideia de sócio, empresa, hackathon",
            ]}
          />
        </div>
      )}

      <ConviteCenso
        link={p.link_formulario}
        texto="Se a sua startup nasceu numa universidade ou num ambiente de inovação de Lavras, o Censo é o que mostra isso em número."
      />
    </Pagina>
  );
}

function Grupo({ titulo, lista }: { titulo: string; lista: Instituicao[] }) {
  return (
    <Cartao>
      <h2 className="font-display text-lg font-semibold text-texto">{titulo}</h2>
      <ul className="mt-4 divide-y divide-fio">
        {lista.map((i) => (
          <li key={i.id} className="flex items-start justify-between gap-4 py-3.5">
            <div>
              <p className="font-medium text-texto">
                {i.sigla && i.sigla !== i.nome ? (
                  <>
                    {i.sigla} <span className="font-normal text-fraco">· {i.nome}</span>
                  </>
                ) : (
                  i.nome
                )}
              </p>
              {i.descricao && <p className="mt-1 text-sm text-fraco">{i.descricao}</p>}
            </div>
            {i.site && (
              <a
                href={i.site}
                target="_blank"
                rel="noopener"
                aria-label={`Site de ${i.nome}`}
                className="mt-0.5 shrink-0 text-fraco hover:text-verde"
              >
                <ArrowUpRight className="size-5" />
              </a>
            )}
          </li>
        ))}
        {!lista.length && <li className="py-3 text-sm text-fraco">Nenhuma cadastrada.</li>}
      </ul>
    </Cartao>
  );
}
