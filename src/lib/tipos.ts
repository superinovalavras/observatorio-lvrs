// Formas dos dados, iguais às tabelas de supabase/migrations/0001_observatorio.sql.

export type Captacao = { fonte: string; valor: number | null; ano: number | null };

export type Startup = {
  id: string;
  nome: string;
  cnpj: string | null;
  vertical: string | null;
  fase: string | null;
  origem: string | null;
  tecnologias: string[];
  cidade: string | null;
  instituicao_id: string | null;
  resumo: string | null;
  site: string | null;
  instagram: string | null;
  linkedin: string | null;
  clientes_faixa: string | null;
  faturamento_faixa: string | null;
  crescimento_mensal: number | null;
  runway: string | null;
  empregos_lavras: number | null;
  captacoes: Captacao[];
  investidores_alvo: string[];
  gargalos: string[];
  projetos: string[];
  incentivos: string[];
  sandbox: string | null;
  /** A startup marcou no formulário que aceita aparecer na vitrine. Sem isso, nada dela é público. */
  consentiu_vitrine: boolean;
  /** Quais campos públicos o admin libera — só valem se consentiu_vitrine. Nome, vertical e fase vão sempre. */
  publico_site: boolean;
  publico_instagram: boolean;
  publico_linkedin: boolean;
  ativa: boolean;
  ciclo: string | null;
  resposta_id: string | null;
  criado_em: string;
  atualizado_em: string;
};

/** O que sai para a vitrine pública: só isto atravessa para o navegador. */
export type StartupPublica = {
  id: string;
  nome: string;
  vertical: string | null;
  fase: string | null;
  site: string | null;
  instagram: string | null;
  linkedin: string | null;
};

export type Instituicao = {
  id: string;
  nome: string;
  sigla: string | null;
  tipo: "ies" | "ambiente";
  descricao: string | null;
  site: string | null;
  ativa: boolean;
  ordem: number;
};

export type Programa = {
  id: string;
  nome: string;
  tipo: "projeto_lvrs" | "edital" | "incentivo" | "programa";
  descricao: string | null;
  link: string | null;
  ativo: boolean;
  ordem: number;
};

export type Indicador = {
  id: string;
  rotulo: string;
  valor: string;
  detalhe: string | null;
  ano: string | null;
  fonte: string | null;
  destaque: boolean;
  ordem: number;
};

export type Parametros = {
  ciclo_atual: string;
  /** Enquanto falso, as abas mostram "aguardando o 1º ciclo" em vez dos gráficos. */
  ciclo_publicado: boolean;
  link_formulario: string;
  /** Grupo mínimo: nenhum recorte com menos startups que isto aparece no site. */
  min_grupo: number;
  atualizado_em: string | null;
};

export type Resposta = {
  id: string;
  ciclo: string;
  chave: string;
  recebida_em: string | null;
  nome: string | null;
  dados: Record<string, string>;
  status: "nova" | "aprovada" | "rejeitada";
  startup_id: string | null;
  importada_em: string;
};

export type Base = {
  origem: "supabase" | "demo" | "vazio";
  parametros: Parametros;
  startups: Startup[];
  instituicoes: Instituicao[];
  programas: Programa[];
  indicadores: Indicador[];
  respostasRecebidas: number;
};
