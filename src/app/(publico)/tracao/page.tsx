import type { Metadata } from "next";
import { AguardandoCiclo, Barras, Cartao, Colunas, ConviteCenso, Kpi, Pagina, Secao, TopoAba } from "@/components/ui";
import { crescimentoMediano, distribuir, faturamentoAgregado, fmtInt, fmtPct, fmtReais, ranking } from "@/lib/agregados";
import { FAIXAS_CLIENTES, FAIXAS_FATURAMENTO, TECNOLOGIAS, VERTICAIS } from "@/lib/censo";
import { carregarBase } from "@/lib/server/dados";

export const metadata: Metadata = { title: "Tração e mercado" };

const curtoClientes = (r: string) =>
  r === "Ainda não possuo clientes" ? "Nenhum" : r.replace(" clientes", "").replace("De ", "").replace("Até ", "até ").replace("Mais de ", "+");

export default async function Tracao() {
  const { parametros: p, startups, respostasRecebidas } = await carregarBase();
  const k = p.min_grupo;

  const faturamento = distribuir(startups, FAIXAS_FATURAMENTO.map((f) => f.rotulo), (s) => s.faturamento_faixa, k);
  const clientes = distribuir(startups, FAIXAS_CLIENTES, (s) => s.clientes_faixa, k);
  const verticais = ranking(startups, VERTICAIS, (s) => s.vertical, k);
  const tecnologias = ranking(startups, TECNOLOGIAS, (s) => s.tecnologias, k);
  const cresc = crescimentoMediano(startups, k);
  const fat = faturamentoAgregado(startups, k);
  const faturam = startups.filter((s) => s.faturamento_faixa && s.faturamento_faixa !== FAIXAS_FATURAMENTO[0].rotulo).length;
  const curtoFat = (r: string) => FAIXAS_FATURAMENTO.find((f) => f.rotulo === r)?.curto ?? r;

  return (
    <Pagina>
      <TopoAba
        elemento="ondas"
        rotulo="Tração e mercado"
        titulo={
          <>
            Quanto o ecossistema <em>vende e cresce</em>.
          </>
        }
        intro="Faixas de faturamento, base de clientes e ritmo de crescimento declarados pelas startups. O Censo pergunta em faixas, e não em valores exatos, para proteger cada empresa."
      />

      {p.ciclo_publicado ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi
              rotulo="Startups que já faturam"
              valor={fmtInt(faturam)}
              detalhe={startups.length ? `${Math.round((faturam / startups.length) * 100)}% das que responderam` : undefined}
              oculto={faturam < k}
              k={k}
            />
            <Kpi
              rotulo="Crescimento mensal mediano"
              valor={cresc.valor != null ? fmtPct(cresc.valor) : "—"}
              detalhe={`entre ${cresc.n} startups que informaram a taxa`}
              oculto={cresc.oculto}
              k={k}
              atraso={80}
            />
            <Kpi
              rotulo="Faturamento agregado por ano"
              valor={
                <span className="text-2xl sm:text-3xl">
                  {fmtReais(fat.valor.min)} {fat.valor.max === null ? "ou mais" : <>a {fmtReais(fat.valor.max)}</>}
                </span>
              }
              detalhe="intervalo: soma dos pisos e dos tetos das faixas"
              oculto={fat.oculto}
              k={k}
              atraso={160}
            />
          </div>

          <Secao titulo="Faixa de faturamento bruto anual" sub="Projeção do ano atual ou valor real do ano anterior.">
            <Cartao>
              <Colunas fatias={faturamento} k={k} rotulo={curtoFat} />
            </Cartao>
          </Secao>

          <Secao titulo="Clientes ativos" sub="Quantos clientes cada startup tem hoje.">
            <Cartao>
              <Colunas fatias={clientes} k={k} rotulo={curtoClientes} />
            </Cartao>
          </Secao>

          <div className="grid gap-x-8 lg:grid-cols-2">
            <Secao titulo="Verticais de atuação">
              <Cartao>
                <Barras fatias={verticais} k={k} base={startups.length} />
              </Cartao>
            </Secao>
            <Secao titulo="Tecnologias usadas" sub="Uma startup pode usar várias.">
              <Cartao>
                <Barras fatias={tecnologias} k={k} base={startups.length} />
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
            "Distribuição por faixa de faturamento",
            "Volume de clientes ativos",
            "Taxa de crescimento mensal mediana",
            "Verticais e tecnologias do ecossistema",
          ]}
        />
      )}

      <ConviteCenso
        link={p.link_formulario}
        texto="Sua faixa de faturamento entra só na soma do ecossistema. É esse número que mostra o peso real da tecnologia na economia de Lavras."
      />
    </Pagina>
  );
}
