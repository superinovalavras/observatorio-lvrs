-- Observatório VDI — esquema, RLS e conteúdo inicial.
--
-- Princípios:
--  * O navegador nunca lê estas tabelas. A chave anon não tem permissão em nada:
--    o site público é renderizado no servidor (service_role) e só manda para o
--    navegador números agregados e a vitrine mínima de quem consentiu.
--  * `respostas` guarda a linha bruta da planilha do Google Form, como chegou.
--    `startups` é a versão codificada e aprovada pelo admin — é dela que saem os gráficos.
--  * Quem é admin está em `admins` (user_id do Supabase Auth). Criar a conta em
--    Authentication > Users e depois rodar:
--      insert into admins (user_id, email) values ('UUID-DO-USUARIO', 'EMAIL');

create extension if not exists "pgcrypto";

create table if not exists admins (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  criado_em timestamptz not null default now()
);

create table if not exists parametros (
  id              int primary key default 1 check (id = 1),
  ciclo_atual     text not null default '2026.2',
  ciclo_publicado boolean not null default false,
  link_formulario text not null default 'https://forms.gle/DjiXtAcWsXYxnbHJ7',
  min_grupo       int not null default 3 check (min_grupo between 2 and 20),
  atualizado_em   timestamptz
);
insert into parametros (id) values (1) on conflict do nothing;

create table if not exists instituicoes (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  sigla     text,
  tipo      text not null default 'ies' check (tipo in ('ies', 'ambiente')),
  descricao text,
  site      text,
  ativa     boolean not null default true,
  ordem     int not null default 0
);

create table if not exists programas (
  id        text primary key,               -- slug; nos projetos LVRS+ é o id gravado em startups.projetos
  nome      text not null,
  tipo      text not null check (tipo in ('projeto_lvrs', 'edital', 'incentivo', 'programa')),
  descricao text,
  link      text,
  ativo     boolean not null default true,
  ordem     int not null default 0
);

create table if not exists indicadores (
  id       uuid primary key default gen_random_uuid(),
  rotulo   text not null,
  valor    text not null,
  detalhe  text,
  ano      text,
  fonte    text,
  destaque boolean not null default false,
  ordem    int not null default 0
);

create table if not exists respostas (
  id           uuid primary key default gen_random_uuid(),
  ciclo        text not null,
  chave        text not null unique,          -- hash da linha: reimportar a mesma planilha não duplica
  recebida_em  timestamptz,
  nome         text,
  dados        jsonb not null,
  status       text not null default 'nova' check (status in ('nova', 'aprovada', 'rejeitada')),
  startup_id   uuid,
  importada_em timestamptz not null default now()
);

create table if not exists startups (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null,
  cnpj               text,
  vertical           text,
  fase               text,
  origem             text,
  tecnologias        text[] not null default '{}',
  cidade             text,
  instituicao_id     uuid references instituicoes(id) on delete set null,
  resumo             text,
  site               text,
  instagram          text,
  linkedin           text,
  clientes_faixa     text,
  faturamento_faixa  text,
  crescimento_mensal numeric(6,2),
  runway             text,
  empregos_lavras    int check (empregos_lavras >= 0),
  captacoes          jsonb not null default '[]',
  investidores_alvo  text[] not null default '{}',
  gargalos           text[] not null default '{}',
  projetos           text[] not null default '{}',
  incentivos         text[] not null default '{}',
  sandbox            text check (sandbox in ('usa', 'pretende', 'nao')),
  consentiu_vitrine  boolean not null default false,
  publico_site       boolean not null default true,
  publico_instagram  boolean not null default false,
  publico_linkedin   boolean not null default false,
  ativa              boolean not null default true,
  ciclo              text,
  resposta_id        uuid references respostas(id) on delete set null,
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now()
);

alter table respostas add constraint respostas_startup_fk
  foreign key (startup_id) references startups(id) on delete set null;

-- Ninguém além do service_role toca nestas tabelas.
alter table admins       enable row level security;
alter table parametros   enable row level security;
alter table instituicoes enable row level security;
alter table programas    enable row level security;
alter table indicadores  enable row level security;
alter table respostas    enable row level security;
alter table startups     enable row level security;
revoke all on admins, parametros, instituicoes, programas, indicadores, respostas, startups from anon, authenticated;

-- ───────────── Conteúdo inicial (igual a src/lib/semente.ts) ─────────────

insert into instituicoes (nome, sigla, tipo, descricao, site, ordem) values
  ('Universidade Federal de Lavras', 'UFLA', 'ies', 'Universidade federal, referência em ciências agrárias e de alimentos.', 'https://ufla.br', 1),
  ('Centro Universitário de Lavras', 'Unilavras', 'ies', null, 'https://unilavras.edu.br', 2),
  ('Fadminas', 'Fadminas', 'ies', null, null, 3),
  ('Fagammon', 'Fagammon', 'ies', null, null, 4),
  ('IpêTech', 'IpêTech', 'ambiente', null, null, 5),
  ('YouX Lab', 'YouX Lab', 'ambiente', 'Talentos digitais e inclusão produtiva.', null, 6);

insert into programas (id, nome, tipo, descricao, link, ordem) values
  ('cluster', 'Cluster Agro-Food-Tech', 'projeto_lvrs', 'Trilha Empreendedora', null, 1),
  ('hub', 'Hub de Inovação e sua Gestão', 'projeto_lvrs', 'Onde empresas, talentos e governo se encontram', null, 2),
  ('blue-zone', 'Blue Zone Lavras', 'projeto_lvrs', 'Bairro-modelo de longevidade e vida saudável', null, 3),
  ('cinturao', 'Cinturão do Alimento/Verde', 'projeto_lvrs', 'Diagnóstico do potencial produtivo do território', null, 4),
  ('festival', 'Festival do Futuro do Alimento', 'projeto_lvrs', 'Summit gastronômico e tecnológico', null, 5),
  ('circuito', 'Circuito Territorial Vale dos Ipês', 'projeto_lvrs', 'Rota de experiências', null, 6),
  ('usina', 'Usina de Compostagem', 'projeto_lvrs', 'Reciclagem de alimentos e economia circular', null, 7),
  ('estacao', 'Estação Férrea', 'projeto_lvrs', 'Hub criativo, enogastronômico e de inovação alimentar', null, 8),
  ('governo-digital', 'Governo Digital', 'projeto_lvrs', 'Tecnologia a serviço das pessoas', null, 9),
  ('sandbox', 'Sandbox Regulatório', 'projeto_lvrs', 'Laboratório vivo do futuro do alimento', null, 10),
  ('mba', 'MBA em AgroFoodTech', 'projeto_lvrs', 'Formação avançada para a nova economia do alimento', null, 11),
  ('youx', 'YouX Lab', 'projeto_lvrs', 'Talentos digitais e inclusão produtiva', null, 12),
  ('iss-tecnologico', 'ISS Tecnológico', 'incentivo', 'Incentivo fiscal municipal para empresas de base tecnológica.', null, 20),
  ('iptu', 'IPTU', 'incentivo', 'Incentivo fiscal municipal sobre o imóvel.', null, 21),
  ('launch', 'Launch LVRS+', 'programa', 'Programa de lançamento de startups.', 'https://launch.lvrs.com.br', 30),
  ('lavras-lab', 'Lavras Lab', 'programa', null, 'https://lavraslab.lvrs.com.br', 31)
on conflict (id) do nothing;

insert into indicadores (rotulo, valor, detalhe, ano, fonte, destaque, ordem) values
  ('Habitantes', '111.437', 'estimativa', '2026', 'IBGE, Estimativas de População', true, 1),
  ('PIB municipal', 'R$ 3,92 bi', '+17,0% sobre 2022', '2023', 'IBGE, SIDRA tab. 5938', true, 2),
  ('do PIB da microrregião', '62,72%', 'Lavras polariza 14 municípios', '2023', 'IBGE, SIDRA tab. 5938', true, 3),
  ('Matrículas de graduação', '14.735', '1 em cada 8 moradores', '2024', 'INEP, Sinopse da Educação Superior', true, 4),
  ('Habitantes na região de influência', '238.068', 'Região Imediata de Lavras', '2026', 'IBGE, SIDRA tab. 6579', true, 5),
  ('Vínculos formais de emprego', '27.231', 'julho', '2026', 'Novo CAGED (MTE)', false, 6),
  ('Empresas e organizações atuantes', '5.870', null, '2024', 'IBGE, CEMPRE (SIDRA tab. 9509)', false, 7),
  ('Salário médio formal', 'R$ 3.194,86', '2,3 salários mínimos', '2024', 'IBGE, CEMPRE (SIDRA tab. 9509)', false, 8),
  ('PIB per capita', 'R$ 37.386,83', null, '2023', 'IBGE Cidades', false, 9),
  ('Cursos de graduação', '62', '34 na rede pública, 28 na privada', '2024', 'INEP, Sinopse da Educação Superior', false, 10),
  ('Estudantes de pós-graduação na UFLA', '2.675', null, null, 'FORIPES — UFLA em números', false, 11),
  ('Serviços e setor público no valor adicionado', '76,97%', 'Minas Gerais: 58,30%', '2021', 'IBGE, SIDRA tab. 5938', false, 12);
