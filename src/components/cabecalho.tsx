"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BotaoCenso } from "./botao-censo";

export const ABAS = [
  { href: "/", rotulo: "Panorama", curto: "Panorama" },
  { href: "/startups", rotulo: "Startups", curto: "Startups" },
  { href: "/instituicoes", rotulo: "Instituições", curto: "Instituições" },
  { href: "/programas", rotulo: "Programas e políticas", curto: "Programas" },
  { href: "/tracao", rotulo: "Tração e mercado", curto: "Tração" },
  { href: "/investimento", rotulo: "Investimento e gargalos", curto: "Investimento" },
];

export function Cabecalho({ linkFormulario }: { linkFormulario: string }) {
  const caminho = usePathname();
  const ativa = (href: string) => (href === "/" ? caminho === "/" : caminho.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-fio bg-fundo/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 pt-3 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Observatório VDI — início">
          <Image src="/assets/logo.png" alt="Observatório VDI" width={760} height={521} className="h-11 w-auto sm:h-12" priority />
        </Link>
        <p className="hidden text-[11px] font-medium uppercase leading-tight tracking-[0.18em] text-fraco md:block">
          Dados do ecossistema
          <br />
          de inovação de Lavras
        </p>
        <div className="ml-auto">
          <BotaoCenso href={linkFormulario} tamanho="sm" />
        </div>
      </div>

      <nav aria-label="Abas do Observatório" className="mx-auto max-w-[1240px] px-2 sm:px-6">
        <ul className="sem-barra flex gap-1 overflow-x-auto pt-2">
          {ABAS.map((a) => (
            <li key={a.href} className="shrink-0">
              <Link
                href={a.href}
                aria-current={ativa(a.href) ? "page" : undefined}
                className={`relative block px-3 pb-3 pt-2 text-sm font-medium transition-colors ${
                  ativa(a.href) ? "text-texto" : "text-fraco hover:text-texto"
                }`}
              >
                <span className="lg:hidden">{a.curto}</span>
                <span className="hidden lg:inline">{a.rotulo}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-verde transition-transform duration-300 ${
                    ativa(a.href) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
