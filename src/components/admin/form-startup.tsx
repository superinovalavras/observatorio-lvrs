"use client";

import { useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { salvarStartup } from "@/lib/server/acoes";
import type { Captacao, Instituicao, Programa, Startup } from "@/lib/tipos";
import {
  FAIXAS_CLIENTES,
  FAIXAS_FATURAMENTO,
  FASES,
  FONTES_CAPTACAO,
  GARGALOS,
  INCENTIVOS,
  ORIGENS,
  RUNWAY,
  SANDBOX,
  TECNOLOGIAS,
  VERTICAIS,
} from "@/lib/censo";
import { Campo, CampoLogo, CartaoAdmin, Formulario, btnContorno, btnVerde, inputCls } from "./ui";

type Props = {
  inicial: Partial<Startup>;
  instituicoes: Instituicao[];
  projetos: Programa[];
  respostaId?: string;
  rotulo: string;
};

export function FormStartup({ inicial: s, instituicoes, projetos, respostaId, rotulo }: Props) {
  const [consentiu, setConsentiu] = useState(!!s.consentiu_vitrine);
  const [captacoes, setCaptacoes] = useState<Captacao[]>(s.captacoes?.length ? s.captacoes : []);

  return (
    <Formulario acao={salvarStartup} rotulo={rotulo} botao={respostaId ? btnVerde : undefined}>
      {s.id && <input type="hidden" name="id" value={s.id} />}
      {respostaId && <input type="hidden" name="resposta_id" value={respostaId} />}

      <div className="space-y-5">
        <Bloco titulo="Identificação" sub="Dados de cadastro. CNPJ e cidade nunca aparecem no site.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome da startup *">
              <input name="nome" defaultValue={s.nome ?? ""} required className={inputCls} />
            </Campo>
            <Campo rotulo="CNPJ / CPF">
              <input name="cnpj" defaultValue={s.cnpj ?? ""} className={inputCls} />
            </Campo>
            <Seletor nome="vertical" rotulo="Vertical" opcoes={VERTICAIS} valor={s.vertical} />
            <Seletor nome="fase" rotulo="Fase do negócio" opcoes={FASES} valor={s.fase} />
            <Seletor nome="origem" rotulo="Como surgiu" opcoes={ORIGENS} valor={s.origem} />
            <Campo rotulo="Instituição de origem" ajuda="Universidade ou ambiente de onde vieram os fundadores ou a tecnologia.">
              <select name="instituicao_id" defaultValue={s.instituicao_id ?? ""} className={inputCls}>
                <option value="">— nenhuma —</option>
                {instituicoes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.sigla ?? i.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Cidade">
              <input name="cidade" defaultValue={s.cidade ?? ""} className={inputCls} />
            </Campo>
          </div>
          <Campo rotulo="Resumo (interno)" className="mt-4">
            <textarea name="resumo" defaultValue={s.resumo ?? ""} rows={3} className={inputCls} />
          </Campo>
          <Marcas nome="tecnologias" rotulo="Tecnologias" opcoes={TECNOLOGIAS} valores={s.tecnologias} />
        </Bloco>

        <Bloco
          titulo="Vitrine pública e privacidade"
          sub="A startup só aparece na vitrine se autorizou no formulário. Mesmo assim, só nome, vertical, fase e os links liberados abaixo. Números nunca saem individualmente."
          destaque
        >
          <label className="flex items-start gap-3 rounded-xl border border-papel-fio bg-papel p-4">
            <input type="checkbox" name="consentiu_vitrine" checked={consentiu} onChange={(e) => setConsentiu(e.target.checked)} className="mt-0.5 size-4 accent-[#0a2540]" />
            <span className="text-sm">
              <b className="font-medium">A startup autorizou aparecer na vitrine</b>
              <span className="block text-xs text-slate-500">Marque só se a resposta do formulário disser “Sim” à autorização.</span>
            </span>
          </label>
          <div className="mt-4">
            <CampoLogo atual={s.logo_url} nome={s.nome ?? undefined} />
            <p className="mt-2 text-xs text-slate-500">A logo só aparece na vitrine se a startup autorizou.</p>
          </div>
          <div className={`mt-4 grid gap-4 sm:grid-cols-3 ${consentiu ? "" : "pointer-events-none opacity-40"}`}>
            <LinkPublico nome="site" rotulo="Site" valor={s.site} publico={s.publico_site ?? true} />
            <LinkPublico nome="instagram" rotulo="Instagram" valor={s.instagram} publico={s.publico_instagram ?? false} />
            <LinkPublico nome="linkedin" rotulo="LinkedIn" valor={s.linkedin} publico={s.publico_linkedin ?? false} />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" name="ativa" defaultChecked={s.ativa ?? true} className="size-4 accent-[#0a2540]" />
            Ativa (entra nos números do site)
          </label>
        </Bloco>

        <Bloco titulo="Tração" sub="Usado só nos gráficos agregados.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Seletor nome="clientes_faixa" rotulo="Clientes" opcoes={FAIXAS_CLIENTES} valor={s.clientes_faixa} />
            <Seletor nome="faturamento_faixa" rotulo="Faturamento bruto anual" opcoes={FAIXAS_FATURAMENTO.map((f) => f.rotulo)} valor={s.faturamento_faixa} />
            <Campo rotulo="Crescimento mensal (%)" ajuda="Número da resposta aberta; vazio se não informou.">
              <input name="crescimento_mensal" type="number" step="0.1" defaultValue={s.crescimento_mensal ?? ""} className={inputCls} />
            </Campo>
          </div>
        </Bloco>

        <Bloco titulo="Recursos e investimento" sub="Codifique o texto livre da resposta: fonte, valor e ano de cada captação.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Seletor nome="runway" rotulo="Recursos para 12 meses" opcoes={RUNWAY} valor={s.runway} />
            <Campo rotulo="Empregos diretos em Lavras">
              <input name="empregos_lavras" type="number" min={0} defaultValue={s.empregos_lavras ?? ""} className={inputCls} />
            </Campo>
          </div>
          <p className="mb-2 mt-5 text-[13px] font-medium">Captações</p>
          <div className="space-y-2">
            {captacoes.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_8rem_6rem_auto] gap-2">
                <select name="cap_fonte" defaultValue={c.fonte} className={inputCls}>
                  {FONTES_CAPTACAO.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
                <input name="cap_valor" placeholder="R$" defaultValue={c.valor ?? ""} inputMode="numeric" className={inputCls} />
                <input name="cap_ano" placeholder="Ano" defaultValue={c.ano ?? ""} inputMode="numeric" className={inputCls} />
                <button type="button" aria-label="Remover captação" onClick={() => setCaptacoes(captacoes.filter((_, j) => j !== i))} className="px-2 text-slate-400 hover:text-red-600">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setCaptacoes([...captacoes, { fonte: FONTES_CAPTACAO[0], valor: null, ano: null }])} className={`${btnContorno} mt-2 h-9`}>
            <Plus className="size-4" /> Adicionar captação
          </button>
          <Campo rotulo="Investidores mapeados" ajuda="Um por linha ou separados por vírgula. Aparecem no site como lista, sem dizer qual startup citou." className="mt-5">
            <textarea name="investidores_alvo" rows={2} defaultValue={(s.investidores_alvo ?? []).join(", ")} className={inputCls} />
          </Campo>
          <Marcas nome="gargalos" rotulo="O que mais impede o crescimento" opcoes={GARGALOS} valores={s.gargalos} />
        </Bloco>

        <Bloco titulo="Lavras: Vale dos Ipês e LVRS+">
          <Marcas nome="projetos" rotulo="Projetos LVRS+ com que pode interagir" opcoes={projetos.map((p) => p.id)} rotulos={Object.fromEntries(projetos.map((p) => [p.id, p.nome]))} valores={s.projetos} />
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Marcas nome="incentivos" rotulo="Incentivos fiscais (usa ou pretende)" opcoes={INCENTIVOS} valores={s.incentivos} />
            <Campo rotulo="Sandbox Regulatório" className="mt-4">
              <select name="sandbox" defaultValue={s.sandbox ?? ""} className={inputCls}>
                <option value="">— não informado —</option>
                {SANDBOX.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.rotulo}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        </Bloco>
      </div>
    </Formulario>
  );
}

function Bloco({ titulo, sub, destaque, children }: { titulo: string; sub?: string; destaque?: boolean; children: ReactNode }) {
  return (
    <CartaoAdmin className={destaque ? "border-emerald-300 ring-1 ring-emerald-100" : ""}>
      <h2 className="font-display text-base font-semibold">{titulo}</h2>
      {sub && <p className="mb-4 mt-1 text-xs leading-relaxed text-slate-500">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </CartaoAdmin>
  );
}

function Seletor({ nome, rotulo, opcoes, valor }: { nome: string; rotulo: string; opcoes: readonly string[]; valor?: string | null }) {
  return (
    <Campo rotulo={rotulo}>
      <select name={nome} defaultValue={valor ?? ""} className={inputCls}>
        <option value="">— não informado —</option>
        {opcoes.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </Campo>
  );
}

function Marcas({ nome, rotulo, opcoes, valores = [], rotulos }: { nome: string; rotulo: string; opcoes: readonly string[]; valores?: string[]; rotulos?: Record<string, string> }) {
  return (
    <fieldset className="mt-4">
      <legend className="mb-2 text-[13px] font-medium">{rotulo}</legend>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="checkbox" name={nome} value={o} defaultChecked={valores.includes(o)} className="peer sr-only" />
            <span className="inline-block rounded-full border border-papel-fio bg-white px-3 py-1.5 text-xs peer-checked:border-fundo peer-checked:bg-fundo peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-fundo/30">
              {rotulos?.[o] ?? o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function LinkPublico({ nome, rotulo, valor, publico }: { nome: string; rotulo: string; valor?: string | null; publico: boolean }) {
  return (
    <div>
      <Campo rotulo={rotulo}>
        <input name={nome} defaultValue={valor ?? ""} className={inputCls} />
      </Campo>
      <label className="mt-1.5 flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" name={`publico_${nome}`} defaultChecked={publico} className="size-3.5 accent-[#0a2540]" />
        Mostrar na vitrine
      </label>
    </div>
  );
}
