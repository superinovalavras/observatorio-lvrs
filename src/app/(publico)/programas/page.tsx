import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { AguardandoCiclo, Barras, Cartao, ConviteCenso, Kpi, Pagina, Secao, TopoAba } from "@/components/ui";
import { distribuir, fmtInt } from "@/lib/agregados";
import { INCENTIVOS, SANDBOX } from "@/lib/censo";
import { carregarBase } from "@/lib/server/dados";

export const metadata: Metadata = { title: "Programas e políticas públicas" };

const TIPO = { edital: "Edital", incentivo: "Incentivo", programa: "Programa", projeto_lvrs: "Projeto" } as const;

export default async function Programas() {
  const { parametros: p, startups, programas, respostasRecebidas } = await carregarBase();
  const k = p.min_grupo;
  const projetos = programas.filter((x) => x.tipo === "projeto_lvrs");
  const outros = programas.filter((x) => x.tipo !== "projeto_lvrs");
  const nomeProj = (id: string) => projetos.find((x) => x.id === id)?.nome ?? id;

  const engajamento = distribuir(startups, projetos.map((x) => x.id), (s) => s.projetos, k);
  const incentivos = distribuir(startups, INCENTIVOS, (s) => s.incentivos, k);
  const sandbox = distribuir(startups, SANDBOX.map((x) => x.id), (s) => s.sandbox, k);
  const conectadas = startups.filter((s) => s.projetos.length > 0).length;
  const comSandbox = startups.filter((s) => s.sandbox === "usa" || s.sandbox === "pretende").length;
  const comIncentivo = startups.filter((s) => s.incentivos.length > 0).length;

  return (
    <Pagina>
      <TopoAba
        elemento="setas"
        rotulo="Programas e políticas públicas"
        titulo={
          <>
            O que a cidade oferece, e <em>quem já se conecta</em>.
          </>
        }
        intro="O LVRS+ (Pacto Lavras pela Inovação) organiza 12 projetos prioritários até 2040. Aqui está o quanto as startups do Censo se veem trabalhando com cada um, e quem usa os incentivos municipais."
      />

      {p.ciclo_publicado ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi
              rotulo="Startups conectadas a projetos"
              valor={fmtInt(conectadas)}
              detalhe={startups.length ? `${Math.round((conectadas / startups.length) * 100)}% das que responderam` : undefined}
              oculto={conectadas < k}
              k={k}
            />
            <Kpi
              rotulo="Usam ou pretendem usar o Sandbox"
              valor={fmtInt(comSandbox)}
              detalhe="Sandbox Regulatório"
              oculto={comSandbox < k}
              k={k}
              atraso={80}
            />
            <Kpi
              rotulo="Com incentivo fiscal municipal"
              valor={fmtInt(comIncentivo)}
              detalhe="ISS Tecnológico ou IPTU"
              oculto={comIncentivo < k}
              k={k}
              atraso={160}
            />
          </div>
          <Secao titulo="Engajamento nos 12 projetos do LVRS+" sub="Startups que disseram poder interagir com cada projeto. Uma startup pode marcar vários.">
            <Cartao>
              <Barras fatias={engajamento} k={k} base={startups.length} rotulo={nomeProj} />
            </Cartao>
          </Secao>
          <div className="grid gap-x-8 lg:grid-cols-2">
            <Secao titulo="Adesão ao Sandbox Regulatório">
              <Cartao>
                <Barras fatias={sandbox} k={k} rotulo={(id) => SANDBOX.find((x) => x.id === id)?.rotulo ?? id} />
              </Cartao>
            </Secao>
            <Secao titulo="Incentivos fiscais municipais" sub="Startups que já usam ou pretendem acessar.">
              <Cartao>
                <Barras fatias={incentivos} k={k} base={startups.length} />
              </Cartao>
            </Secao>
          </div>
        </>
      ) : (
        <AguardandoCiclo
          ciclo={p.ciclo_atual}
          respostas={respostasRecebidas}
          link={p.link_formulario}
          oQueVaiAparecer={[
            "Startups conectadas a cada um dos 12 projetos",
            "Adesão ao Sandbox Regulatório",
            "Uso do ISS Tecnológico e do IPTU",
          ]}
        />
      )}

      <Secao titulo="Os 12 projetos prioritários" sub="Status e metas de cada projeto ficam no painel de gestão do LVRS+.">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projetos.map((x, i) => (
            <li key={x.id} className="flex gap-4 rounded-2xl border border-fio bg-fundo-2/70 p-4">
              {x.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={x.logo_url} alt="" className="size-10 shrink-0 rounded-lg bg-white object-contain p-1" loading="lazy" />
              ) : (
                <span className="font-display text-sm font-semibold tabular-nums text-verde">{String(i + 1).padStart(2, "0")}</span>
              )}
              <div>
                <p className="font-medium text-texto">{x.nome}</p>
                {x.descricao && <p className="mt-0.5 text-sm text-fraco">{x.descricao}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Secao>

      {outros.length > 0 && (
        <Secao titulo="Programas, editais e incentivos">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {outros.map((x) => (
              <li key={x.id} className="flex flex-col rounded-2xl border border-fio bg-fundo-2/70 p-4">
                {x.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={x.logo_url} alt="" className="mb-3 h-10 w-auto max-w-[140px] self-start rounded-md bg-white object-contain p-1" loading="lazy" />
                )}
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fraco">{TIPO[x.tipo]}</p>
                <p className="mt-1.5 font-medium text-texto">{x.nome}</p>
                {x.descricao && <p className="mt-1 text-sm text-fraco">{x.descricao}</p>}
                {x.link && (
                  <a
                    href={x.link}
                    target="_blank"
                    rel="noopener"
                    className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-verde hover:underline"
                  >
                    Conhecer <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Secao>
      )}

      <ConviteCenso
        link={p.link_formulario}
        texto="No Censo você diz com quais projetos sua startup pode trabalhar. A resposta vira ponte com a equipe de cada projeto."
      />
    </Pagina>
  );
}
