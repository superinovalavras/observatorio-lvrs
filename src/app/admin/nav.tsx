"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChartColumn, Inbox, Landmark, Boxes, SlidersHorizontal } from "lucide-react";

const ITENS = [
  { href: "/admin", rotulo: "Respostas do Censo", icone: Inbox, exato: true },
  { href: "/admin/startups", rotulo: "Startups", icone: Boxes },
  { href: "/admin/instituicoes", rotulo: "Instituições", icone: Building2 },
  { href: "/admin/programas", rotulo: "Programas e projetos", icone: Landmark },
  { href: "/admin/indicadores", rotulo: "Lavras em números", icone: ChartColumn },
  { href: "/admin/parametros", rotulo: "Parâmetros", icone: SlidersHorizontal },
];

export function NavAdmin({ novas }: { novas: number }) {
  const caminho = usePathname();
  return (
    <nav>
      <ul className="space-y-0.5">
        {ITENS.map(({ href, rotulo, icone: Icone, exato }) => {
          const ativo = exato ? caminho === href || caminho.startsWith("/admin/respostas") : caminho.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm ${
                  ativo ? "bg-white/10 font-medium text-texto" : "hover:bg-white/5 hover:text-texto"
                }`}
              >
                <Icone className={`size-[18px] ${ativo ? "text-verde" : ""}`} />
                <span className="flex-1">{rotulo}</span>
                {href === "/admin" && novas > 0 && (
                  <span className="rounded-full bg-verde px-2 py-0.5 text-[11px] font-semibold text-tinta">{novas}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
