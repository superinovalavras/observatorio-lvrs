// Vocabulário do Censo Semestral — espelha as opções do formulário
// (../questionario-censo.md e ../criar-google-form.gs). Mudar um rótulo aqui
// não muda o formulário: os dois têm que andar juntos, senão a importação
// deixa de reconhecer a resposta.

export const LINK_FORMULARIO = "https://forms.gle/DjiXtAcWsXYxnbHJ7";

export const VERTICAIS = [
  "AgTech",
  "FoodTech",
  "HealthTech & Wellness",
  "GovTech",
  "EdTech",
  "RetailTech & Gastronomia",
  "Entech & GreenTech",
  "FinTech",
  "Construtech & Proptech",
  "EnergyTech",
  "LogTech & Supply Chain",
  "AdTech & MarTech",
  "HrTech",
  "SocialTech",
  "Outro",
] as const;

/** As verticais que somam no destaque "Capital do Futuro do Alimento". */
export const AGROFOODTECH = ["AgTech", "FoodTech"] as const;
export const ehAgroFood = (v: string | null | undefined) => !!v && (AGROFOODTECH as readonly string[]).includes(v);

export const FASES = ["Ideação", "Validação", "Operação", "Tração", "Escala"] as const;

export const ORIGENS = [
  "Nasceu de uma ideia de um sócio",
  "Spin-off acadêmica (UFLA/IES local)",
  "Spin-off corporativa (nasceu dentro de uma empresa)",
  "Hackathon / Ideathon / Incubadora / Aceleradora / Etc",
  "Outro",
] as const;

export const TECNOLOGIAS = [
  "Blockchain & Rastreabilidade",
  "Inteligência Artificial",
  "Eletrônica & Fotônica",
  "Materiais avançados & Nanotecnologia",
  "Químicos & Biotecnologia",
  "Drone & Vants",
  "Robótica & Automação",
  "Manufatura Aditiva & Impressão 3D",
  "IOT & Sensores",
  "Tecnologia da Informação",
  "Big Data & Analytics",
  "Geoprocessamento & Tecnologias Geoespaciais",
  "Realidade Virtual & Aumentada",
  "Outro",
] as const;

export const FAIXAS_CLIENTES = [
  "Ainda não possuo clientes",
  "Até 10 clientes",
  "De 11 a 50 clientes",
  "De 51 a 100 clientes",
  "De 101 a 200 clientes",
  "De 201 a 500 clientes",
  "De 501 a 1000 clientes",
  "Mais de 1001 clientes",
] as const;

/** Faixas de faturamento com os limites em reais — dão o intervalo do faturamento agregado. */
export const FAIXAS_FATURAMENTO = [
  { rotulo: "Ainda não faturamos", curto: "Não fatura", min: 0, max: 0 },
  { rotulo: "Até R$ 50.000,00", curto: "Até 50 mil", min: 0, max: 50_000 },
  { rotulo: "De R$ 50.001,00 a R$ 250.000,00", curto: "50–250 mil", min: 50_001, max: 250_000 },
  { rotulo: "De R$ 250.001,00 a R$ 500.000,00", curto: "250–500 mil", min: 250_001, max: 500_000 },
  { rotulo: "De R$ 500.001,00 a R$ 1.000.000,00", curto: "500 mil–1 mi", min: 500_001, max: 1_000_000 },
  { rotulo: "De R$ 1.000.001,00 a R$ 5.000.000,00", curto: "1–5 mi", min: 1_000_001, max: 5_000_000 },
  { rotulo: "De R$ 5.000.001,00 a R$ 10.000.000,00", curto: "5–10 mi", min: 5_000_001, max: 10_000_000 },
  { rotulo: "De R$ 10.000.001,00 a R$ 50.000.000,00", curto: "10–50 mi", min: 10_000_001, max: 50_000_000 },
  { rotulo: "De R$ 50.000.001,00 a R$ 100.000.000,00", curto: "50–100 mi", min: 50_000_001, max: 100_000_000 },
  { rotulo: "Acima de R$ 100.000.001,00", curto: "Acima de 100 mi", min: 100_000_001, max: null },
] as const;

export const RUNWAY = ["Sim, com uma certa folga", "Sim, mas com um certo risco", "Não"] as const;

// ── Campos que o formulário pergunta em texto livre e o admin codifica ao aprovar ──

export const FONTES_CAPTACAO = [
  "Recursos próprios / bootstrapping",
  "Investidor anjo",
  "Fundo de venture capital",
  "Aceleradora",
  "FAPEMIG",
  "FINEP",
  "CNPq / outros editais públicos",
  "Crowdfunding",
  "Outro",
] as const;

export const GARGALOS = [
  "Captação de investimento",
  "Acesso a clientes / vendas",
  "Contratação de talentos",
  "Capital de giro / caixa",
  "Regulação e burocracia",
  "Infraestrutura / laboratório",
  "Validação técnica do produto",
  "Gestão e governança",
  "Marketing e marca",
  "Outro",
] as const;

export const INCENTIVOS = ["ISS Tecnológico", "IPTU"] as const;

export const SANDBOX = [
  { id: "usa", rotulo: "Já usa o Sandbox" },
  { id: "pretende", rotulo: "Pretende usar" },
  { id: "nao", rotulo: "Não pretende" },
] as const;

/**
 * Os 12 Projetos Prioritários do LVRS+, na grafia do painel gestaolvrs.govup.io
 * (a mesma de vitrine/src/data/projetos.ts). `chaves` são trechos que o
 * importador procura no texto livre da resposta para sugerir a marcação.
 */
export const PROJETOS_LVRS = [
  { id: "cluster", nome: "Cluster Agro-Food-Tech", chaves: ["cluster"] },
  { id: "hub", nome: "Hub de Inovação e sua Gestão", chaves: ["hub", "ipêtech", "ipetech"] },
  { id: "blue-zone", nome: "Blue Zone Lavras", chaves: ["blue zone"] },
  { id: "cinturao", nome: "Cinturão do Alimento/Verde", chaves: ["cinturão", "cinturao"] },
  { id: "festival", nome: "Festival do Futuro do Alimento", chaves: ["festival"] },
  { id: "circuito", nome: "Circuito Territorial Vale dos Ipês", chaves: ["circuito"] },
  { id: "usina", nome: "Usina de Compostagem", chaves: ["usina", "compostagem"] },
  { id: "estacao", nome: "Estação Férrea", chaves: ["estação", "estacao", "férrea", "ferrea"] },
  { id: "governo-digital", nome: "Governo Digital", chaves: ["governo digital"] },
  { id: "sandbox", nome: "Sandbox Regulatório", chaves: ["sandbox"] },
  { id: "mba", nome: "MBA em AgroFoodTech", chaves: ["mba"] },
  { id: "youx", nome: "YouX Lab", chaves: ["youx"] },
] as const;

/** Os três projetos que a Aba 1 cruza com o AgroFoodTech. */
export const PROJETOS_AGROFOOD = ["cluster", "cinturao", "sandbox"] as const;

export const projetoPorId = (id: string) => PROJETOS_LVRS.find((p) => p.id === id);
export const faixaFaturamento = (rotulo: string | null | undefined) =>
  FAIXAS_FATURAMENTO.find((f) => f.rotulo === rotulo);
