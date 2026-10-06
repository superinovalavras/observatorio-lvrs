import Image from "next/image";
import { Cabecalho } from "@/components/cabecalho";
import { carregarBase } from "@/lib/server/dados";

// Site público: página pronta, refeita a cada 5 min e na hora em que o painel muda algo (revalidatePath).
export const revalidate = 300;

export default async function LayoutPublico({ children }: LayoutProps<"/">) {
  const base = await carregarBase();
  return (
    <>
      {base.origem === "demo" && (
        <p className="bg-amber-300 px-4 py-1.5 text-center text-xs font-semibold text-tinta">
          DADOS FICTÍCIOS — modo de demonstração (OBSERVATORIO_DEMO=1). Nada aqui é real.
        </p>
      )}
      <Cabecalho linkFormulario={base.parametros.link_formulario} />
      <main>{children}</main>
      <footer className="border-t border-fio bg-tinta">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-10 sm:grid-cols-[1fr_auto] sm:px-8">
          <div className="flex items-start gap-4">
            <Image src="/assets/favicon.png" alt="" width={180} height={180} className="size-10 rounded-lg" />
            <p className="text-sm leading-relaxed">
              <b className="font-medium text-texto">Observatório VDI</b> · Censo Semestral Vale dos Ipês
              <br />
              <span className="text-fraco">
                Superintendência de Políticas de Ciência, Tecnologia e Inovação · Prefeitura Municipal de Lavras
              </span>
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Outros sites">
            <a className="hover:text-verde" href="https://lvrs.com.br">LVRS+</a>
            <a className="hover:text-verde" href="https://launch.lvrs.com.br">Launch</a>
            <a className="hover:text-verde" href="https://lavraslab.lvrs.com.br">Lavras Lab</a>
            <a className="text-fraco hover:text-verde" href="/entrar">Acesso da equipe</a>
          </nav>
          <p className="text-xs leading-relaxed text-fraco sm:col-span-2">
            Os dados das startups são publicados apenas de forma agregada e anonimizada (Lei nº 13.709/2018 — LGPD e
            Orientação Administrativa Municipal nº 001/2026/CTTC). A vitrine mostra só as startups que autorizaram aparecer
            nela, e só nome, vertical, fase e links.
          </p>
        </div>
      </footer>
    </>
  );
}
