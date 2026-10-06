// Startups FICTÍCIAS para ver os gráficos funcionando antes do 1º ciclo.
// Só entram com OBSERVATORIO_DEMO=1 (desenvolvimento) e o site inteiro ganha
// uma faixa "dados fictícios". Nunca ligar isso no ar.

import type { Startup } from "./tipos";
import {
  FAIXAS_CLIENTES,
  FAIXAS_FATURAMENTO,
  FASES,
  FONTES_CAPTACAO,
  GARGALOS,
  ORIGENS,
  PROJETOS_LVRS,
  RUNWAY,
  TECNOLOGIAS,
  VERTICAIS,
} from "./censo";
import { INSTITUICOES } from "./semente";

function sorteador(semente: number) {
  let s = semente;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function startupsDemo(): Startup[] {
  const r = sorteador(42);
  const um = <T,>(l: readonly T[], vies = 1) => l[Math.min(l.length - 1, Math.floor(Math.pow(r(), vies) * l.length))];
  const alguns = <T,>(l: readonly T[], max: number) => [...new Set(Array.from({ length: 1 + Math.floor(r() * max) }, () => um(l)))];
  const verticaisPeso = ["AgTech", "AgTech", "AgTech", "FoodTech", "FoodTech", ...VERTICAIS.slice(2, 10)];
  const agora = new Date().toISOString();

  return Array.from({ length: 24 }, (_, i) => {
    const fase = um(FASES, 1.3);
    const faseIdx = FASES.indexOf(fase);
    const fat = faseIdx < 2 ? FAIXAS_FATURAMENTO[r() < 0.6 ? 0 : 1] : um(FAIXAS_FATURAMENTO.slice(1, 7), 1.6);
    const captou = r() < 0.5;
    return {
      id: `demo-${i + 1}`,
      nome: `Startup fictícia ${String.fromCharCode(65 + i)}`,
      cnpj: null,
      vertical: um(verticaisPeso),
      fase,
      origem: um(ORIGENS, 1.2),
      tecnologias: alguns(TECNOLOGIAS.slice(0, 13), 3),
      cidade: "Lavras",
      instituicao_id: r() < 0.6 ? `inst-${1 + Math.floor(r() * 3)}` : null,
      resumo: null,
      logo_url: null,
      site: r() < 0.7 ? "https://exemplo.com.br" : null,
      instagram: null,
      linkedin: null,
      clientes_faixa: faseIdx < 1 ? FAIXAS_CLIENTES[0] : um(FAIXAS_CLIENTES.slice(1), 1.8),
      faturamento_faixa: fat.rotulo,
      crescimento_mensal: faseIdx >= 2 ? Math.round(r() * 25 * 10) / 10 : null,
      runway: um(RUNWAY),
      empregos_lavras: 1 + Math.floor(Math.pow(r(), 2) * 30),
      captacoes: captou
        ? [{ fonte: um(FONTES_CAPTACAO.slice(0, 7)), valor: Math.round(r() * 20) * 50_000 + 50_000, ano: 2022 + Math.floor(r() * 4) }]
        : [],
      investidores_alvo: [],
      gargalos: alguns(GARGALOS.slice(0, 9), 2),
      projetos: alguns(PROJETOS_LVRS.map((p) => p.id), 3),
      incentivos: r() < 0.3 ? ["ISS Tecnológico"] : [],
      sandbox: um(["usa", "pretende", "nao", "nao"]),
      consentiu_vitrine: r() < 0.75,
      publico_site: true,
      publico_instagram: false,
      publico_linkedin: false,
      ativa: true,
      ciclo: "2026.2",
      resposta_id: null,
      criado_em: agora,
      atualizado_em: agora,
    };
  });
}

export const instituicoesDemo = () => INSTITUICOES.map((x, i) => ({ ...x, id: `inst-${i + 1}` }));
