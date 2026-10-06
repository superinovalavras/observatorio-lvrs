"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin, ehAdmin, servico, supabaseSessao } from "./sessao";
import { normal, sugerir, valorDe } from "../importacao";
import type { Captacao } from "../tipos";

export type Resultado = { ok: true; msg?: string } | { ok: false; erro: string } | undefined;

const texto = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v || null;
};
const inteiro = (fd: FormData, k: string) => {
  const v = texto(fd, k);
  const n = v == null ? NaN : Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const lista = (fd: FormData, k: string) => fd.getAll(k).map(String).filter(Boolean);
const marcado = (fd: FormData, k: string) => fd.get(k) === "on";

/** Tudo o que o site público lê muda junto. */
function republicar() {
  for (const p of ["/", "/startups", "/instituicoes", "/programas", "/tracao", "/investimento"]) revalidatePath(p);
  revalidatePath("/admin", "layout");
}

// ───── Conta ─────

export async function entrar(_: Resultado, fd: FormData): Promise<Resultado> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const senha = String(fd.get("senha") ?? "");
  if (!email || !senha) return { ok: false, erro: "Informe e-mail e senha." };
  const sb = await supabaseSessao();
  const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error || !data.user) return { ok: false, erro: "E-mail ou senha incorretos." };
  if (!(await ehAdmin(data.user.id))) {
    await sb.auth.signOut();
    return { ok: false, erro: "Esta conta não tem acesso ao painel do Observatório." };
  }
  redirect("/admin");
}

export async function sair() {
  await (await supabaseSessao()).auth.signOut();
  redirect("/entrar");
}

// ───── Respostas do Google Form ─────

/** Recebe as linhas da planilha (já lidas no navegador) e guarda as que ainda não existem. */
export async function importarRespostas(linhas: Record<string, string>[]): Promise<Resultado> {
  await exigirAdmin();
  if (!Array.isArray(linhas) || !linhas.length) return { ok: false, erro: "A planilha está vazia." };
  if (linhas.length > 2000) return { ok: false, erro: "Planilha grande demais (máx. 2.000 linhas)." };
  const amostra = linhas[0];
  if (!Object.keys(amostra).some((c) => normal(c).includes("nome da startup")))
    return { ok: false, erro: "Não achei a coluna “Nome da Startup”. É a planilha de respostas do Censo?" };

  const sb = servico();
  const { data: par } = await sb.from("parametros").select("ciclo_atual").eq("id", 1).single();
  const ciclo = par?.ciclo_atual ?? "2026.2";

  const registros = linhas
    .filter((l) => valorDe(l, "nome"))
    .map((dados) => {
      const carimbo = valorDe(dados, "carimbo");
      const quando = carimbo ? dataDoForms(carimbo) : null;
      return {
        ciclo,
        chave: createHash("sha256").update(JSON.stringify(dados)).digest("hex"),
        recebida_em: quando,
        nome: valorDe(dados, "nome"),
        dados,
      };
    });

  const { data, error } = await sb
    .from("respostas")
    .upsert(registros, { onConflict: "chave", ignoreDuplicates: true })
    .select("id");
  if (error) {
    console.error("importarRespostas", error.code);
    return { ok: false, erro: "Não foi possível gravar as respostas." };
  }
  republicar();
  const novas = data?.length ?? 0;
  return {
    ok: true,
    msg: `${novas} ${novas === 1 ? "resposta nova importada" : "respostas novas importadas"}; ${registros.length - novas} já estavam no painel.`,
  };
}

/** O Forms grava "06/10/2026 14:32:10" (pt-BR). */
function dataDoForms(t: string) {
  const m = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  const [, d, mes, a, h = "0", mi = "0", s = "0"] = m;
  return new Date(Date.UTC(+a, +mes - 1, +d, +h + 3, +mi, +s)).toISOString(); // -03:00
}

export async function rejeitarResposta(id: string) {
  await exigirAdmin();
  await servico().from("respostas").update({ status: "rejeitada" }).eq("id", id);
  republicar();
  redirect("/admin");
}

export async function reabrirResposta(id: string) {
  await exigirAdmin();
  await servico().from("respostas").update({ status: "nova" }).eq("id", id).eq("status", "rejeitada");
  republicar();
}

/** Aprovar em 1 clique: grava a sugestão automática como está. */
export async function aprovarDireto(id: string) {
  await exigirAdmin();
  const sb = servico();
  const { data: r } = await sb.from("respostas").select("*").eq("id", id).single();
  if (!r || r.status !== "nova") return;
  const s = sugerir(r.dados);
  const { data: nova } = await sb
    .from("startups")
    .insert({ ...s, ciclo: r.ciclo, resposta_id: id })
    .select("id")
    .single();
  if (nova) await sb.from("respostas").update({ status: "aprovada", startup_id: nova.id }).eq("id", id);
  republicar();
}

// ───── Startups ─────

function startupDoForm(fd: FormData) {
  const fontes = lista(fd, "cap_fonte");
  const valores = fd.getAll("cap_valor").map(String);
  const anos = fd.getAll("cap_ano").map(String);
  const captacoes: Captacao[] = fontes
    .map((fonte, i) => ({
      fonte,
      valor: valores[i] ? Number(valores[i].replace(/\./g, "").replace(",", ".")) || null : null,
      ano: anos[i] ? Number(anos[i]) || null : null,
    }))
    .filter((c) => c.fonte);

  return {
    nome: texto(fd, "nome") ?? "(sem nome)",
    cnpj: texto(fd, "cnpj"),
    vertical: texto(fd, "vertical"),
    fase: texto(fd, "fase"),
    origem: texto(fd, "origem"),
    tecnologias: lista(fd, "tecnologias"),
    cidade: texto(fd, "cidade"),
    instituicao_id: texto(fd, "instituicao_id"),
    resumo: texto(fd, "resumo"),
    site: texto(fd, "site"),
    instagram: texto(fd, "instagram"),
    linkedin: texto(fd, "linkedin"),
    clientes_faixa: texto(fd, "clientes_faixa"),
    faturamento_faixa: texto(fd, "faturamento_faixa"),
    crescimento_mensal: inteiro(fd, "crescimento_mensal"),
    runway: texto(fd, "runway"),
    empregos_lavras: inteiro(fd, "empregos_lavras"),
    captacoes,
    investidores_alvo: String(fd.get("investidores_alvo") ?? "")
      .split(/[\n,;]/)
      .map((x) => x.trim())
      .filter(Boolean),
    gargalos: lista(fd, "gargalos"),
    projetos: lista(fd, "projetos"),
    incentivos: lista(fd, "incentivos"),
    sandbox: texto(fd, "sandbox"),
    consentiu_vitrine: marcado(fd, "consentiu_vitrine"),
    publico_site: marcado(fd, "publico_site"),
    publico_instagram: marcado(fd, "publico_instagram"),
    publico_linkedin: marcado(fd, "publico_linkedin"),
    ativa: marcado(fd, "ativa"),
    atualizado_em: new Date().toISOString(),
  };
}

/** Cria ou atualiza. Se vier de uma resposta, a resposta fica aprovada e ligada à startup. */
export async function salvarStartup(_: Resultado, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const sb = servico();
  const id = texto(fd, "id");
  const respostaId = texto(fd, "resposta_id");
  const dados = startupDoForm(fd);
  if (!dados.nome || dados.nome === "(sem nome)") return { ok: false, erro: "Informe o nome da startup." };

  let startupId = id;
  if (id) {
    const { error } = await sb.from("startups").update(dados).eq("id", id);
    if (error) return { ok: false, erro: "Não foi possível salvar." };
  } else {
    const { data: par } = await sb.from("parametros").select("ciclo_atual").eq("id", 1).single();
    const { data, error } = await sb
      .from("startups")
      .insert({ ...dados, ciclo: par?.ciclo_atual ?? null, resposta_id: respostaId })
      .select("id")
      .single();
    if (error || !data) return { ok: false, erro: "Não foi possível criar a startup." };
    startupId = data.id;
  }
  if (respostaId) await sb.from("respostas").update({ status: "aprovada", startup_id: startupId }).eq("id", respostaId);
  republicar();
  redirect(respostaId ? "/admin" : "/admin/startups?salvo=1");
}

export async function excluirStartup(id: string) {
  await exigirAdmin();
  const sb = servico();
  await sb.from("respostas").update({ status: "nova", startup_id: null }).eq("startup_id", id);
  await sb.from("startups").delete().eq("id", id);
  republicar();
  redirect("/admin/startups");
}

export async function alternarStartup(id: string, campo: "ativa" | "consentiu_vitrine", valor: boolean) {
  await exigirAdmin();
  await servico().from("startups").update({ [campo]: valor, atualizado_em: new Date().toISOString() }).eq("id", id);
  republicar();
}

// ───── Cadastros: instituições, programas, indicadores ─────

export async function salvarInstituicao(_: Resultado, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const id = texto(fd, "id");
  const dados = {
    nome: texto(fd, "nome"),
    sigla: texto(fd, "sigla"),
    tipo: texto(fd, "tipo") === "ambiente" ? "ambiente" : "ies",
    descricao: texto(fd, "descricao"),
    site: texto(fd, "site"),
    ordem: inteiro(fd, "ordem") ?? 0,
    ativa: marcado(fd, "ativa"),
  };
  if (!dados.nome) return { ok: false, erro: "Informe o nome." };
  const q = servico().from("instituicoes");
  const { error } = id ? await q.update(dados).eq("id", id) : await q.insert(dados);
  if (error) return { ok: false, erro: "Não foi possível salvar." };
  republicar();
  return { ok: true, msg: "Salvo." };
}

export async function excluirInstituicao(id: string) {
  await exigirAdmin();
  await servico().from("instituicoes").delete().eq("id", id);
  republicar();
}

const slug = (t: string) =>
  normal(t)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

export async function salvarPrograma(_: Resultado, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const id = texto(fd, "id");
  const tipo = texto(fd, "tipo") ?? "programa";
  if (!["projeto_lvrs", "edital", "incentivo", "programa"].includes(tipo)) return { ok: false, erro: "Tipo inválido." };
  const dados = {
    nome: texto(fd, "nome"),
    tipo,
    descricao: texto(fd, "descricao"),
    link: texto(fd, "link"),
    ordem: inteiro(fd, "ordem") ?? 0,
    ativo: marcado(fd, "ativo"),
  };
  if (!dados.nome) return { ok: false, erro: "Informe o nome." };
  const q = servico().from("programas");
  const { error } = id ? await q.update(dados).eq("id", id) : await q.insert({ ...dados, id: slug(dados.nome) });
  if (error) return { ok: false, erro: error.code === "23505" ? "Já existe um item com esse nome." : "Não foi possível salvar." };
  republicar();
  return { ok: true, msg: "Salvo." };
}

export async function excluirPrograma(id: string) {
  await exigirAdmin();
  await servico().from("programas").delete().eq("id", id);
  republicar();
}

export async function salvarIndicador(_: Resultado, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const id = texto(fd, "id");
  const dados = {
    rotulo: texto(fd, "rotulo"),
    valor: texto(fd, "valor"),
    detalhe: texto(fd, "detalhe"),
    ano: texto(fd, "ano"),
    fonte: texto(fd, "fonte"),
    ordem: inteiro(fd, "ordem") ?? 0,
    destaque: marcado(fd, "destaque"),
  };
  if (!dados.rotulo || !dados.valor) return { ok: false, erro: "Informe rótulo e valor." };
  const q = servico().from("indicadores");
  const { error } = id ? await q.update(dados).eq("id", id) : await q.insert(dados);
  if (error) return { ok: false, erro: "Não foi possível salvar." };
  republicar();
  return { ok: true, msg: "Salvo." };
}

export async function excluirIndicador(id: string) {
  await exigirAdmin();
  await servico().from("indicadores").delete().eq("id", id);
  republicar();
}

// ───── Parâmetros ─────

export async function salvarParametros(_: Resultado, fd: FormData): Promise<Resultado> {
  await exigirAdmin();
  const link = texto(fd, "link_formulario");
  if (!link || !/^https:\/\//.test(link)) return { ok: false, erro: "O link do formulário precisa começar com https://" };
  const min = inteiro(fd, "min_grupo") ?? 3;
  if (min < 2 || min > 20) return { ok: false, erro: "O grupo mínimo vai de 2 a 20." };
  const { error } = await servico()
    .from("parametros")
    .update({
      ciclo_atual: texto(fd, "ciclo_atual") ?? "2026.2",
      ciclo_publicado: marcado(fd, "ciclo_publicado"),
      link_formulario: link,
      min_grupo: min,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { ok: false, erro: "Não foi possível salvar." };
  republicar();
  return { ok: true, msg: "Parâmetros salvos. O site já reflete a mudança." };
}
