// Tudo o que o site público mostra sai daqui, já agregado.
//
// Regra de sigilo (o Censo promete divulgação "agregada e anonimizada"):
// nenhum recorte com menos de `k` startups aparece com número. Com 1 ou 2
// empresas numa fatia, o "agregado" é a própria empresa. Fatias pequenas viram
// `oculto: true` e o gráfico mostra "menos de k" no lugar do valor.

import type { Startup } from "./tipos";
import { FAIXAS_FATURAMENTO, faixaFaturamento } from "./censo";

export type Fatia = { rotulo: string; n: number; oculto: boolean };

/** Conta startups por categoria, na ordem das `categorias` dadas (a ordem do formulário). */
export function distribuir(
  startups: Startup[],
  categorias: readonly string[],
  valorDe: (s: Startup) => string | string[] | null | undefined,
  k: number,
): Fatia[] {
  const contagem = new Map<string, number>(categorias.map((c) => [c, 0]));
  for (const s of startups) {
    const v = valorDe(s);
    const lista = Array.isArray(v) ? v : v ? [v] : [];
    for (const item of new Set(lista)) contagem.set(item, (contagem.get(item) ?? 0) + 1);
  }
  const fatias = [...contagem].map(([rotulo, n]) => ({ rotulo, n, oculto: n > 0 && n < k }));

  // Supressão complementar: numa pergunta de escolha única o total é conhecido,
  // então uma fatia oculta sozinha sai por subtração. Oculta-se também a menor visível.
  const unica = startups.every((s) => !Array.isArray(valorDe(s)));
  if (unica && fatias.filter((f) => f.oculto).length === 1) {
    const menor = fatias.filter((f) => !f.oculto && f.n > 0).sort((a, b) => a.n - b.n)[0];
    if (menor) menor.oculto = true;
  }
  return fatias;
}

/** Mesma contagem, mas ordenada da maior para a menor e sem as categorias zeradas (rankings). */
export function ranking(
  startups: Startup[],
  categorias: readonly string[],
  valorDe: (s: Startup) => string | string[] | null | undefined,
  k: number,
): Fatia[] {
  // As ocultas vão para o fim em ordem alfabética: ordená-las pelo número
  // entregaria quem tem 2 e quem tem 1.
  return distribuir(startups, categorias, valorDe, k)
    .filter((f) => f.n > 0)
    .sort((a, b) =>
      a.oculto !== b.oculto ? (a.oculto ? 1 : -1) : a.oculto ? a.rotulo.localeCompare(b.rotulo, "pt-BR") : b.n - a.n,
    );
}

export type Total<T> = { valor: T; n: number; oculto: boolean };

const ocultar = (n: number, k: number) => n < k;

export function somaEmpregos(startups: Startup[], k: number): Total<number> {
  const com = startups.filter((s) => s.empregos_lavras != null);
  return {
    valor: com.reduce((acc, s) => acc + (s.empregos_lavras ?? 0), 0),
    n: com.length,
    oculto: ocultar(com.length, k),
  };
}

/** As faixas não permitem um total exato; o honesto é dar o intervalo entre a soma dos pisos e a dos tetos. */
export function faturamentoAgregado(
  startups: Startup[],
  k: number,
): Total<{ min: number; max: number | null }> {
  const com = startups.map((s) => faixaFaturamento(s.faturamento_faixa)).filter((f) => !!f);
  let min = 0;
  let max: number | null = 0;
  for (const f of com) {
    min += f.min;
    max = max === null || f.max === null ? null : max + f.max;
  }
  return { valor: { min, max }, n: com.length, oculto: ocultar(com.length, k) };
}

/** Mediana, não média: uma startup crescendo 300% ao mês puxaria a média para longe do ecossistema. */
export function crescimentoMediano(startups: Startup[], k: number): Total<number | null> {
  const v = startups
    .map((s) => s.crescimento_mensal)
    .filter((x): x is number => x != null)
    .sort((a, b) => a - b);
  if (!v.length) return { valor: null, n: 0, oculto: true };
  const meio = Math.floor(v.length / 2);
  const mediana = v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
  return { valor: mediana, n: v.length, oculto: ocultar(v.length, k) };
}

export function captacaoTotal(startups: Startup[], k: number, fonte?: string): Total<number> {
  const com = startups.filter((s) => s.captacoes.some((c) => c.valor != null && (!fonte || c.fonte === fonte)));
  const valor = com.reduce(
    (acc, s) =>
      acc + s.captacoes.filter((c) => !fonte || c.fonte === fonte).reduce((a, c) => a + (c.valor ?? 0), 0),
    0,
  );
  return { valor, n: com.length, oculto: ocultar(com.length, k) };
}

export const ordemFaturamento = FAIXAS_FATURAMENTO.map((f) => f.rotulo);

// ── Formatação ──

const milhar = new Intl.NumberFormat("pt-BR");
export const fmtInt = (n: number) => milhar.format(n);

export function fmtReais(n: number) {
  if (n >= 1_000_000_000) return `R$ ${(n / 1_000_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} bi`;
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return `R$ ${milhar.format(n)}`;
}

export const fmtPct = (n: number) => `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
