import { AguardandoCiclo, Barras, Cartao, ConviteCenso, Fonte, Kpi, Pagina, Secao, TopoAba } from "@/components/ui";
import { captacaoTotal, distribuir, faturamentoAgregado, fmtInt, fmtReais, somaEmpregos } from "@/lib/agregados";
import { FASES, PROJETOS_AGROFOOD, ehAgroFood, projetoPorId } from "@/lib/censo";
import { carregarBase } from "@/lib/server/dados";

export default async function Panorama() {
  const { parametros: p, startups, indicadores, respostasRecebidas } = await carregarBase();
  const k = p.min_grupo;
  const publicado = p.ciclo_publicado;

  const agro = startups.filter((s) => ehAgroFood(s.vertical));
  const fat = faturamentoAgregado(startups, k);
  const emp = somaEmpregos(startups, k);
  const fases = distribuir(startups, FASES, (s) => s.fase, k);
  const faseLider = [...fases].filter((f) => !f.oculto).sort((a, b) => b.n - a.n)[0];

  const agroEmp = somaEmpregos(agro, k);
  const agroCap = captacaoTotal(agro, k);
  const agroProjetos = PROJETOS_AGROFOOD.map((id) => ({
    id,
    nome: projetoPorId(id)!.nome,
    n: agro.filter((s) => s.projetos.includes(id)).length,
  }));

  const destaques = indicadores.filter((i) => i.destaque);
  const outros = indicadores.filter((i) => !i.destaque);

  return (
    <Pagina>
      <TopoAba
        elemento="irradia"
        rotulo={`Panorama · Censo ${p.ciclo_atual}`}
        titulo={
          <>
            O ecossistema de inovação de Lavras, em <em>dados declarados</em>.
          </>
        }
        intro="A cada seis meses, as startups do Vale dos Ipês respondem ao Censo Semestral. O Observatório transforma essas respostas em números públicos e agregados, para quem quer investir, estudar, empreender ou fazer política pública em Lavras."
      />

      {publicado ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi rotulo="Startups no Censo" valor={fmtInt(startups.length)} detalhe={`ciclo ${p.ciclo_atual}`} oculto={startups.length < k} k={k} />
            <Kpi
              rotulo="Empregos diretos em Lavras"
              valor={fmtInt(emp.valor)}
              detalhe={`declarados por ${emp.n} startups`}
              oculto={emp.oculto}
              k={k}
              atraso={80}
            />
            <Kpi
              rotulo="Faturamento agregado"
              valor={
                <span className="text-2xl sm:text-3xl">
                  {fmtReais(fat.valor.min)} {fat.valor.max === null ? "ou mais" : <>a {fmtReais(fat.valor.max)}</>}
                </span>
              }
              detalhe="por ano · soma das faixas declaradas"
              oculto={fat.oculto}
              k={k}
              atraso={160}
            />
            <Kpi
              rotulo="Fase mais comum"
              valor={faseLider?.rotulo ?? "—"}
              detalhe={faseLider ? `${faseLider.n} startups` : undefined}
              oculto={!faseLider}
              k={k}
              atraso={240}
            />
          </div>

          <Secao titulo="Fase de maturidade" sub="Em que estágio estão as startups que responderam, da ideia à escala.">
            <Cartao>
              <Barras fatias={fases} k={k} />
            </Cartao>
          </Secao>
        </>
      ) : (
        <AguardandoCiclo
          ciclo={p.ciclo_atual}
          respostas={respostasRecebidas}
          link={p.link_formulario}
          oQueVaiAparecer={[
            "Total de startups do ecossistema",
            "Empregos diretos gerados em Lavras",
            "Faturamento agregado do ecossistema",
            "Distribuição por fase de maturidade",
          ]}
        />
      )}

      {/* AgroFoodTech: o destaque absoluto da aba. */}
      <section className="relative mt-16 overflow-hidden rounded-3xl border border-verde/40 bg-gradient-to-br from-verde/[0.12] via-fundo-2 to-fundo-2 p-6 sm:p-10">
        <img src="/assets/elementos/irradia.png" alt="" aria-hidden className="pointer-events-none absolute -right-24 -top-24 w-[420px] opacity-[0.17]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-verde">Vertical em destaque · AgroFoodTech</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight text-texto sm:text-4xl">
            Lavras, Capital do Futuro do Alimento.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed">
            A vocação declarada da cidade para 2040 se apoia na pesquisa da UFLA em ciências agrárias e de alimentos e na
            base agropecuária da região. Aqui o Observatório separa as startups de AgTech e FoodTech do resto do ecossistema.
          </p>

          {publicado ? (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Kpi
                  rotulo="Startups AgroFoodTech"
                  valor={fmtInt(agro.length)}
                  detalhe={startups.length ? `${Math.round((agro.length / startups.length) * 100)}% do ecossistema` : undefined}
                  oculto={agro.length < k}
                  k={k}
                />
                <Kpi rotulo="Empregos diretos" valor={fmtInt(agroEmp.valor)} detalhe="em Lavras" oculto={agroEmp.oculto} k={k} atraso={80} />
                <Kpi
                  rotulo="Investimento captado"
                  valor={fmtReais(agroCap.valor)}
                  detalhe={`por ${agroCap.n} startups, todas as fontes`}
                  oculto={agroCap.oculto}
                  k={k}
                  atraso={160}
                />
              </div>
              <h3 className="mt-10 font-display text-lg font-semibold text-texto">Conexão com os projetos do setor</h3>
              <p className="mt-1 text-sm text-fraco">Startups AgroFoodTech que disseram poder interagir com cada projeto do LVRS+.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {agroProjetos.map((x) => (
                  <Cartao key={x.id}>
                    <p className="text-sm text-fraco">{x.nome}</p>
                    <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-texto">
                      {x.n > 0 && x.n < k ? <span className="text-base text-fraco">menos de {k}</span> : fmtInt(x.n)}
                    </p>
                  </Cartao>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {agroProjetos.map((x) => (
                <Cartao key={x.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fraco">Projeto LVRS+</p>
                  <p className="mt-2 font-display text-lg font-semibold text-texto">{x.nome}</p>
                  <p className="mt-1 text-sm text-fraco">Quantas startups se conectam a ele: publicado no fim do ciclo.</p>
                </Cartao>
              ))}
            </div>
          )}
        </div>
      </section>

      <Secao
        titulo="Lavras em números"
        sub="O contexto da cidade em fontes públicas oficiais. Cada número traz ano de referência e fonte."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {destaques.map((i) => (
            <Cartao key={i.id}>
              <p className="font-display text-2xl font-semibold tabular-nums text-azul sm:text-[28px]">{i.valor}</p>
              <p className="mt-1 text-sm font-medium text-texto">{i.rotulo}</p>
              {i.detalhe && <p className="mt-1 text-[13px] text-fraco">{i.detalhe}</p>}
              <p className="mt-3 text-[11px] leading-snug text-fraco">
                {i.fonte}
                {i.ano && ` · ${i.ano}`}
              </p>
            </Cartao>
          ))}
        </div>
        {outros.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-fio">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Outros indicadores de Lavras</caption>
              <thead className="bg-fundo-2 text-xs uppercase tracking-wider text-fraco">
                <tr>
                  <th className="px-4 py-3 font-medium">Indicador</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Ano</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Fonte</th>
                </tr>
              </thead>
              <tbody>
                {outros.map((i) => (
                  <tr key={i.id} className="border-t border-fio">
                    <td className="px-4 py-3 text-texto">
                      {i.rotulo}
                      {i.detalhe && <span className="block text-xs text-fraco">{i.detalhe}</span>}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-texto">{i.valor}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">{i.ano ?? "—"}</td>
                    <td className="hidden px-4 py-3 text-fraco md:table-cell">{i.fonte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Fonte>Base: “Lavras em Números”, Superintendência de Políticas de Ciência, Tecnologia e Inovação.</Fonte>
      </Secao>

      <ConviteCenso
        link={p.link_formulario}
        texto="O retrato do ecossistema é exatamente o que as startups daqui respondem. Cada resposta entra nos números desta página e orienta incentivo, programa e projeto da cidade."
      />
    </Pagina>
  );
}
