import "server-only";
import { cache } from "react";
import type { Base, Indicador, Instituicao, Parametros, Programa, Startup } from "../tipos";
import { INDICADORES, INSTITUICOES, PARAMETROS_PADRAO, PROGRAMAS } from "../semente";
import { instituicoesDemo, startupsDemo } from "../demo";
import { supabaseServico } from "./supabase";

export const modoDemo = () => process.env.OBSERVATORIO_DEMO === "1" && process.env.NODE_ENV !== "production";

/**
 * A base inteira do site público, lida uma vez por requisição.
 * Sem Supabase, cai no conteúdo-semente (e, em modo demo, em startups fictícias).
 * As startups vêm completas: SÓ os agregados e a StartupPublica podem sair para o navegador.
 */
export const carregarBase = cache(async (): Promise<Base> => {
  const sb = supabaseServico();
  if (!sb || modoDemo()) {
    const demo = modoDemo();
    return {
      origem: demo ? "demo" : "vazio",
      parametros: { ...PARAMETROS_PADRAO, ciclo_publicado: demo },
      startups: demo ? startupsDemo() : [],
      instituicoes: demo ? instituicoesDemo() : INSTITUICOES.map((x, i) => ({ ...x, id: `inst-${i + 1}` })),
      programas: PROGRAMAS,
      indicadores: INDICADORES.map((x, i) => ({ ...x, id: `ind-${i + 1}` })),
      respostasRecebidas: demo ? 24 : 0,
    };
  }

  const [par, st, ins, pro, ind, resp] = await Promise.all([
    sb.from("parametros").select("*").eq("id", 1).maybeSingle(),
    sb.from("startups").select("*").eq("ativa", true),
    sb.from("instituicoes").select("*").eq("ativa", true).order("ordem"),
    sb.from("programas").select("*").eq("ativo", true).order("ordem"),
    sb.from("indicadores").select("*").order("ordem"),
    sb.from("respostas").select("id", { count: "exact", head: true }),
  ]);
  const erro = [par, st, ins, pro, ind].find((r) => r.error)?.error;
  if (erro) console.error("carregarBase", erro.code);

  return {
    origem: "supabase",
    parametros: { ...PARAMETROS_PADRAO, ...((par.data as Partial<Parametros>) ?? {}) },
    startups: (st.data as Startup[]) ?? [],
    instituicoes: (ins.data as Instituicao[]) ?? [],
    programas: (pro.data as Programa[]) ?? [],
    indicadores: (ind.data as Indicador[]) ?? [],
    respostasRecebidas: resp.count ?? 0,
  };
});
