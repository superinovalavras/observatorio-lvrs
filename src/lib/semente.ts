// Conteúdo inicial: o mesmo que a migração grava no banco. Também é o que o
// site mostra quando roda sem Supabase configurado. Depois que o banco existe,
// quem manda é o painel admin — editar aqui não muda o site no ar.

import type { Indicador, Instituicao, Parametros, Programa } from "./tipos";
import { LINK_FORMULARIO, PROJETOS_LVRS } from "./censo";

export const PARAMETROS_PADRAO: Parametros = {
  ciclo_atual: "2026.2",
  ciclo_publicado: false,
  link_formulario: LINK_FORMULARIO,
  min_grupo: 3,
  atualizado_em: null,
};

/** Fonte: ../../dados/lavras-em-numeros.md (Superintendência de CT&I, 28/09/2026). */
export const INDICADORES: Omit<Indicador, "id">[] = [
  { rotulo: "Habitantes", valor: "111.437", detalhe: "estimativa", ano: "2026", fonte: "IBGE, Estimativas de População", destaque: true, ordem: 1 },
  { rotulo: "PIB municipal", valor: "R$ 3,92 bi", detalhe: "+17,0% sobre 2022", ano: "2023", fonte: "IBGE, SIDRA tab. 5938", destaque: true, ordem: 2 },
  { rotulo: "do PIB da microrregião", valor: "62,72%", detalhe: "Lavras polariza 14 municípios", ano: "2023", fonte: "IBGE, SIDRA tab. 5938", destaque: true, ordem: 3 },
  { rotulo: "Matrículas de graduação", valor: "14.735", detalhe: "1 em cada 8 moradores", ano: "2024", fonte: "INEP, Sinopse da Educação Superior", destaque: true, ordem: 4 },
  { rotulo: "Habitantes na região de influência", valor: "238.068", detalhe: "Região Imediata de Lavras", ano: "2026", fonte: "IBGE, SIDRA tab. 6579", destaque: true, ordem: 5 },
  { rotulo: "Vínculos formais de emprego", valor: "27.231", detalhe: "julho", ano: "2026", fonte: "Novo CAGED (MTE)", destaque: false, ordem: 6 },
  { rotulo: "Empresas e organizações atuantes", valor: "5.870", detalhe: null, ano: "2024", fonte: "IBGE, CEMPRE (SIDRA tab. 9509)", destaque: false, ordem: 7 },
  { rotulo: "Salário médio formal", valor: "R$ 3.194,86", detalhe: "2,3 salários mínimos", ano: "2024", fonte: "IBGE, CEMPRE (SIDRA tab. 9509)", destaque: false, ordem: 8 },
  { rotulo: "PIB per capita", valor: "R$ 37.386,83", detalhe: null, ano: "2023", fonte: "IBGE Cidades", destaque: false, ordem: 9 },
  { rotulo: "Cursos de graduação", valor: "62", detalhe: "34 na rede pública, 28 na privada", ano: "2024", fonte: "INEP, Sinopse da Educação Superior", destaque: false, ordem: 10 },
  { rotulo: "Estudantes de pós-graduação na UFLA", valor: "2.675", detalhe: null, ano: null, fonte: "FORIPES — UFLA em números", destaque: false, ordem: 11 },
  { rotulo: "Serviços e setor público no valor adicionado", valor: "76,97%", detalhe: "Minas Gerais: 58,30%", ano: "2021", fonte: "IBGE, SIDRA tab. 5938", destaque: false, ordem: 12 },
];

export const INSTITUICOES: Omit<Instituicao, "id">[] = [
  { nome: "Universidade Federal de Lavras", sigla: "UFLA", tipo: "ies", descricao: "Universidade federal, referência em ciências agrárias e de alimentos.", site: "https://ufla.br", ativa: true, ordem: 1 },
  { nome: "Centro Universitário de Lavras", sigla: "Unilavras", tipo: "ies", descricao: null, site: "https://unilavras.edu.br", ativa: true, ordem: 2 },
  { nome: "Fadminas", sigla: "Fadminas", tipo: "ies", descricao: null, site: null, ativa: true, ordem: 3 },
  { nome: "Fagammon", sigla: "Fagammon", tipo: "ies", descricao: null, site: null, ativa: true, ordem: 4 },
  { nome: "IpêTech", sigla: "IpêTech", tipo: "ambiente", descricao: null, site: null, ativa: true, ordem: 5 },
  { nome: "YouX Lab", sigla: "YouX Lab", tipo: "ambiente", descricao: "Talentos digitais e inclusão produtiva.", site: null, ativa: true, ordem: 6 },
];

const SUBTITULOS: Record<string, string> = {
  cluster: "Trilha Empreendedora",
  hub: "Onde empresas, talentos e governo se encontram",
  "blue-zone": "Bairro-modelo de longevidade e vida saudável",
  cinturao: "Diagnóstico do potencial produtivo do território",
  festival: "Summit gastronômico e tecnológico",
  circuito: "Rota de experiências",
  usina: "Reciclagem de alimentos e economia circular",
  estacao: "Hub criativo, enogastronômico e de inovação alimentar",
  "governo-digital": "Tecnologia a serviço das pessoas",
  sandbox: "Laboratório vivo do futuro do alimento",
  mba: "Formação avançada para a nova economia do alimento",
  youx: "Talentos digitais e inclusão produtiva",
};

/** `id` dos projetos LVRS+ é o mesmo de PROJETOS_LVRS — é por ele que a startup se liga ao projeto. */
export const PROGRAMAS: Programa[] = [
  ...PROJETOS_LVRS.map((p, i) => ({
    id: p.id,
    nome: p.nome,
    tipo: "projeto_lvrs" as const,
    descricao: SUBTITULOS[p.id] ?? null,
    link: null,
    ativo: true,
    ordem: i + 1,
  })),
  { id: "iss-tecnologico", nome: "ISS Tecnológico", tipo: "incentivo", descricao: "Incentivo fiscal municipal para empresas de base tecnológica.", link: null, ativo: true, ordem: 20 },
  { id: "iptu", nome: "IPTU", tipo: "incentivo", descricao: "Incentivo fiscal municipal sobre o imóvel.", link: null, ativo: true, ordem: 21 },
  { id: "launch", nome: "Launch LVRS+", tipo: "programa", descricao: "Programa de lançamento de startups.", link: "https://launch.lvrs.com.br", ativo: true, ordem: 30 },
  { id: "lavras-lab", nome: "Lavras Lab", tipo: "programa", descricao: null, link: "https://lavraslab.lvrs.com.br", ativo: true, ordem: 31 },
];
