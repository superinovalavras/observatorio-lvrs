import { servico } from "@/lib/server/sessao";
import { salvarParametros } from "@/lib/server/acoes";
import { PARAMETROS_PADRAO } from "@/lib/semente";
import type { Parametros } from "@/lib/tipos";
import { Campo, CartaoAdmin, Formulario, TituloAdmin, inputCls } from "@/components/admin/ui";

export default async function PaginaParametros() {
  const { data } = await servico().from("parametros").select("*").eq("id", 1).maybeSingle();
  const p: Parametros = { ...PARAMETROS_PADRAO, ...(data ?? {}) };
  const { count } = await servico().from("startups").select("id", { count: "exact", head: true }).eq("ativa", true);

  return (
    <div className="max-w-3xl">
      <TituloAdmin titulo="Parâmetros" sub="Configurações que valem para o site inteiro." />
      <CartaoAdmin>
        <Formulario acao={salvarParametros}>
          <div className="space-y-6">
            <label className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50/60 p-4">
              <input type="checkbox" name="ciclo_publicado" defaultChecked={p.ciclo_publicado} className="mt-0.5 size-4 accent-[#0a2540]" />
              <span className="text-sm">
                <b className="font-medium">Publicar os números do ciclo</b>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                  Desmarcado, todas as abas mostram “aguardando o ciclo” com o botão do formulário. Marque quando o ciclo fechar e
                  as respostas estiverem revisadas. Hoje há {count ?? 0} startups ativas.
                </span>
              </span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Ciclo atual" ajuda="Ex.: 2026.2. Respostas importadas e startups novas entram neste ciclo.">
                <input name="ciclo_atual" defaultValue={p.ciclo_atual} className={inputCls} />
              </Campo>
              <Campo
                rotulo="Grupo mínimo para publicar"
                ajuda="Nenhum recorte com menos startups que isto mostra número no site. Padrão: 3."
              >
                <input name="min_grupo" type="number" min={2} max={20} defaultValue={p.min_grupo} className={inputCls} />
              </Campo>
            </div>
            <Campo rotulo="Link do formulário do Censo" ajuda="O destino de todos os botões “Responder o censo”.">
              <input name="link_formulario" type="url" defaultValue={p.link_formulario} className={inputCls} />
            </Campo>
          </div>
        </Formulario>
      </CartaoAdmin>
    </div>
  );
}
