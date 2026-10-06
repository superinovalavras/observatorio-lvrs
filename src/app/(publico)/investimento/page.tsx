import type { Metadata } from "next";
import { AguardandoCiclo, Barras, Cartao, ConviteCenso, Kpi, Pagina, PartesDoTodo, Secao, TopoAba } from "@/components/ui";
import { captacaoTotal, distribuir, fmtInt, fmtReais, ranking } from "@/lib/agregados";
import { FONTES_CAPTACAO, GARGALOS, RUNWAY } from "@/lib/censo";
import { carregarBase } from "@/lib/server/dados";

export const metadata: Metadata = { title: "Investimento e gargalos" };

export default async function Investimento() {
  const { parametros: p, startups, respostasRecebidas } = await carregarBase();
  const k = p.min_grupo;

  const runway = distribuir(startups, RUNWAY, (s) => s.runway, k);
  const fontes = ranking(startups, FONTES_CAPTACAO, (s) => s.captacoes.map((c) => c.fonte), k);
  const gargalos = ranking(startups, GARGALOS, (s) => s.gargalos, k);
  const total = captacaoTotal(startups, k);
  const captaram = startups.filter((s) => s.captacoes.length > 0).length;
  const comFolga = startups.filter((s) => s.runway === RUNWAY[0]).length;
  const comRunway = startups.filter((s) => s.runway).length;

  // Valor por fonte só aparece se a fonte tiver k ou mais startups.
  const valorPorFonte = fontes
    .filter((f) => !f.oculto)
    .map((f) => ({ fonte: f.rotulo, ...captacaoTotal(startups, k, f.rotulo) }))
    .filter((x) => !x.oculto && x.valor > 0);

  const investidores = [...new Set(startups.flatMap((s) => s.investidores_alvo).map((x) => x.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );

  return (
    <Pagina>
      <TopoAba
        elemento="setas"
        rotulo="Investimento e gargalos"
        titulo={
          <>
            Saúde financeira e o que <em>trava o crescimento</em>.
          </>
        }
        intro="Quanto as startups já captaram e de quem, quanto fôlego de caixa têm para os próximos 12 meses e o que mais as impede de crescer. O ranking de gargalos é o que orienta as políticas públicas da cidade."
      />

      {p.ciclo_publicado ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi
              rotulo="Investimento externo captado"
              valor={fmtReais(total.valor)}
              detalhe={`soma declarada por ${total.n} startups`}
              oculto={total.oculto}
              k={k}
            />
            <Kpi
              rotulo="Startups que já captaram"
              valor={fmtInt(captaram)}
              detalhe={startups.length ? `${Math.round((captaram / startups.length) * 100)}% das que responderam` : undefined}
              oculto={captaram < k}
              k={k}
              atraso={80}
            />
            <Kpi
              rotulo="Têm caixa com folga para 12 meses"
              valor={comRunway ? `${Math.round((comFolga / comRunway) * 100)}%` : "—"}
              detalhe={`${comFolga} de ${comRunway} startups`}
              oculto={comFolga < k}
              k={k}
              atraso={160}
            />
          </div>

          <div className="grid gap-x-8 lg:grid-cols-2">
            <Secao titulo="Fôlego de caixa: os próximos 12 meses" sub="“A empresa tem recursos disponíveis para os próximos 12 meses?”">
              <Cartao>
                <PartesDoTodo fatias={runway} k={k} />
              </Cartao>
            </Secao>
            <Secao titulo="De onde veio o investimento" sub="Startups que captaram de cada fonte. Uma startup pode ter várias.">
              <Cartao>
                {fontes.length ? <Barras fatias={fontes} k={k} /> : <p className="text-sm text-fraco">Nenhuma captação declarada.</p>}
                {valorPorFonte.length > 0 && (
                  <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-fio pt-5">
                    {valorPorFonte.map((x) => (
                      <div key={x.fonte}>
                        <dt className="text-xs text-fraco">{x.fonte}</dt>
                        <dd className="font-display text-lg font-semibold text-texto">{fmtReais(x.valor)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Cartao>
            </Secao>
          </div>

          <Secao
            titulo="O que mais impede o crescimento"
            sub="Resposta aberta do Censo, agrupada pela equipe do Observatório. É o principal insumo para incentivos, editais e programas."
          >
            <Cartao destaque>
              {gargalos.length ? (
                <Barras
                  fatias={gargalos}
                  k={k}
                  base={startups.length}
                  rotulo={(r) => {
                    const i = gargalos.findIndex((g) => g.rotulo === r);
                    return gargalos[i].oculto ? r : `${i + 1}º  ${r}`;
                  }}
                />
              ) : (
                <p className="text-sm text-fraco">Nenhum gargalo registrado.</p>
              )}
            </Cartao>
          </Secao>

          {investidores.length > 0 && (
            <Secao titulo="Investidores no radar" sub="Fundos, aceleradoras e fontes que as startups disseram ter mapeado para captar.">
              <ul className="flex flex-wrap gap-2">
                {investidores.map((x) => (
                  <li key={x} className="rounded-full border border-fio-forte px-3.5 py-1.5 text-sm text-texto">
                    {x}
                  </li>
                ))}
              </ul>
            </Secao>
          )}
        </>
      ) : (
        <AguardandoCiclo
          ciclo={p.ciclo_atual}
          respostas={respostasRecebidas}
          link={p.link_formulario}
          oQueVaiAparecer={[
            "Investimento captado e de quais fontes",
            "Fôlego de caixa para 12 meses",
            "Ranking dos maiores gargalos",
            "Investidores mapeados pelas startups",
          ]}
        />
      )}

      <ConviteCenso
        link={p.link_formulario}
        texto="Responda dizendo o que trava a sua startup. O ranking de gargalos é o que a Prefeitura usa para desenhar o próximo incentivo."
      />
    </Pagina>
  );
}
