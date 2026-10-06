// Lê uma linha da planilha de respostas do Google Form e SUGERE a codificação
// em campos estruturados. É só sugestão: o admin confere e corrige antes de aprovar.
//
// As colunas são achadas por trecho do título da pergunta (o Forms usa o título
// como cabeçalho). Se alguém mudar o título no Forms, ajustar os trechos aqui.

import type { Captacao, Startup } from "./tipos";
import {
  FAIXAS_CLIENTES,
  FAIXAS_FATURAMENTO,
  FASES,
  ORIGENS,
  PROJETOS_LVRS,
  RUNWAY,
  TECNOLOGIAS,
  VERTICAIS,
} from "./censo";

export const normal = (t: string) =>
  t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();

/** Trecho do cabeçalho (já normalizado) que identifica cada pergunta. */
export const COLUNAS = {
  carimbo: ["carimbo de data/hora", "timestamp"],
  nome: ["nome da startup"],
  cnpj: ["cnpj"],
  origem: ["como surgiu"],
  vertical: ["vertical de atuacao"],
  tecnologias: ["tecnologias usadas"],
  cidade: ["endereco — cidade", "endereco - cidade"],
  resumo: ["resumo da startup"],
  fase: ["fase do negocio"],
  site: ["redes sociais — site", "redes sociais - site"],
  instagram: ["instagram"],
  linkedin: ["redes sociais — linkedin", "redes sociais - linkedin"],
  clientes: ["quantos clientes possui"],
  faturamento: ["faturamento bruto anual"],
  crescimento: ["taxa de crescimento mensal"],
  runway: ["sua empresa tem recursos disponiveis"],
  investidores: ["investidores que voce tem mapeado"],
  captacao: ["ja captou investimento externo"],
  empregos: ["quantos empregos diretos"],
  gargalos: ["o que mais impede o seu crescimento"],
  incentivos: ["incentivo fiscal municipal"],
  projetos: ["12 projetos do lvrs"],
  consentimento: ["vitrine"],
} as const;

export type Coluna = keyof typeof COLUNAS;

export function valorDe(dados: Record<string, string>, col: Coluna): string {
  const chaves = Object.keys(dados);
  for (const trecho of COLUNAS[col]) {
    const k = chaves.find((c) => normal(c).includes(trecho));
    if (k) return String(dados[k] ?? "").trim();
  }
  return "";
}

/** Acha a opção oficial que corresponde ao texto respondido (ignorando acento e caixa). */
function opcao(texto: string, opcoes: readonly string[]) {
  // Sem pontuação: "Sim mas com risco" e "Sim, mas com risco" são a mesma resposta.
  const limpo = (x: string) => normal(x).replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  const t = limpo(texto);
  if (!t) return null;
  return opcoes.find((o) => limpo(o) === t) ?? opcoes.find((o) => t.startsWith(limpo(o)) || limpo(o).startsWith(t)) ?? null;
}

const contem = (texto: string, chaves: string[]) => chaves.some((c) => normal(texto).includes(c));

function numero(texto: string): number | null {
  const m = texto.replace(/\./g, "").match(/\d+(,\d+)?/);
  return m ? Number(m[0].replace(",", ".")) : null;
}

/** "R$ 500.000,00", "500 mil", "1,2 milhão" → reais. */
export function valorEmReais(texto: string): number | null {
  const t = normal(texto);
  const m = t.match(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?\s*(mil|milhao|milhoes|mi\b|k\b)?/);
  if (!m) return null;
  let v = Number(m[1].replace(/\./g, "") + (m[2] ? "." + m[2] : ""));
  if (m[3] === "mil" || m[3] === "k") v *= 1_000;
  if (m[3] && m[3].startsWith("mi")) v *= 1_000_000;
  return Number.isFinite(v) && v > 0 ? Math.round(v) : null;
}

const FONTE_CHAVES: Record<string, string[]> = {
  "Investidor anjo": ["anjo"],
  "Fundo de venture capital": ["venture", "fundo", " vc"],
  Aceleradora: ["aceleradora"],
  FAPEMIG: ["fapemig"],
  FINEP: ["finep"],
  "CNPq / outros editais públicos": ["cnpq", "edital", "sebrae", "embrapii"],
  Crowdfunding: ["crowdfunding", "equity crowd"],
  "Recursos próprios / bootstrapping": ["proprio", "bootstrap"],
};

const GARGALO_CHAVES: Record<string, string[]> = {
  "Captação de investimento": ["captac", "investimento", "investidor"],
  "Acesso a clientes / vendas": ["cliente", "venda", "mercado"],
  "Contratação de talentos": ["talento", "contrata", "mao de obra", "equipe"],
  "Capital de giro / caixa": ["caixa", "capital de giro", "dinheiro", "financeiro"],
  "Regulação e burocracia": ["regula", "burocra", "licenc", "anvisa", "mapa"],
  "Infraestrutura / laboratório": ["infraestrutura", "laborat", "espaco"],
  "Validação técnica do produto": ["validac", "prototip", "mvp", "produto"],
  "Gestão e governança": ["gestao", "governanca", "processo"],
  "Marketing e marca": ["marketing", "marca", "divulga"],
};

export function sugerir(dados: Record<string, string>): Partial<Startup> {
  const v = (c: Coluna) => valorDe(dados, c);

  const tecnologias = v("tecnologias")
    .split(/,\s*(?=[A-ZÁÉÍÓÚÂÊÔ])/)
    .map((t) => opcao(t, TECNOLOGIAS))
    .filter((t): t is string => !!t);

  const captTexto = v("captacao");
  const captou = captTexto && !/^\s*n(a|ã)o\b/i.test(captTexto);
  const captacoes: Captacao[] = captou
    ? Object.entries(FONTE_CHAVES)
        .filter(([, ch]) => contem(" " + captTexto, ch))
        .map(([fonte]) => ({ fonte, valor: null, ano: null }))
    : [];
  if (captou && captacoes.length === 0) captacoes.push({ fonte: "Outro", valor: null, ano: null });
  if (captacoes.length) {
    captacoes[0].valor = valorEmReais(captTexto);
    captacoes[0].ano = Number(captTexto.match(/20\d{2}/)?.[0]) || null;
  }

  const incTexto = v("incentivos");
  const negou = /^\s*n(a|ã)o\b/i.test(incTexto);
  const incentivos = negou
    ? []
    : [contem(incTexto, ["iss"]) && "ISS Tecnológico", contem(incTexto, ["iptu"]) && "IPTU"].filter((x): x is string => !!x);
  const sandbox = !incTexto
    ? null
    : !contem(incTexto, ["sandbox"]) || negou
      ? "nao"
      : contem(incTexto, ["ja uso", "utilizamos", "ja utiliza", "usamos"])
        ? "usa"
        : "pretende";

  const projTexto = normal(v("projetos"));
  const projetos = PROJETOS_LVRS.filter((p) => p.chaves.some((c) => projTexto.includes(normal(c)))).map((p) => p.id);

  const gargTexto = v("gargalos");
  const gargalos = Object.entries(GARGALO_CHAVES)
    .filter(([, ch]) => contem(gargTexto, ch))
    .map(([g]) => g)
    .slice(0, 3);

  const empregos = numero(v("empregos"));
  const cresc = v("crescimento").match(/(\d+(?:[.,]\d+)?)\s*%/);

  return {
    nome: v("nome") || "(sem nome)",
    cnpj: v("cnpj") || null,
    origem: opcao(v("origem"), ORIGENS),
    vertical: opcao(v("vertical"), VERTICAIS),
    tecnologias,
    cidade: v("cidade") || null,
    resumo: v("resumo") || null,
    fase: opcao(v("fase"), FASES),
    site: v("site") || null,
    instagram: v("instagram") || null,
    linkedin: v("linkedin") || null,
    clientes_faixa: opcao(v("clientes"), FAIXAS_CLIENTES),
    faturamento_faixa: opcao(
      v("faturamento"),
      FAIXAS_FATURAMENTO.map((f) => f.rotulo),
    ),
    crescimento_mensal: cresc ? Number(cresc[1].replace(",", ".")) : null,
    runway: opcao(v("runway"), RUNWAY),
    empregos_lavras: empregos != null && empregos < 100_000 ? Math.round(empregos) : null,
    captacoes,
    investidores_alvo: v("investidores")
      .split(/[,;\n/]| e /)
      .map((x) => x.trim())
      .filter((x) => x.length > 1 && x.length < 60),
    gargalos: gargalos.length ? gargalos : gargTexto ? ["Outro"] : [],
    projetos,
    incentivos,
    sandbox,
    consentiu_vitrine: /^\s*sim/i.test(v("consentimento")),
  };
}

/** Uma linha de CSV com aspas, como o Google Sheets exporta. */
export function lerCsv(texto: string): string[][] {
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') (campo += '"'), i++;
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ",") linha.push(campo), (campo = "");
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo), linhas.push(linha), (linha = []), (campo = "");
    } else campo += c;
  }
  if (campo || linha.length) linha.push(campo), linhas.push(linha);
  return linhas.filter((l) => l.some((x) => x.trim()));
}
