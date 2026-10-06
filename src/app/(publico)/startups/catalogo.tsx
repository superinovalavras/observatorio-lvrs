"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { StartupPublica } from "@/lib/tipos";
import { FASES, VERTICAIS, ehAgroFood } from "@/lib/censo";
import { BotaoCenso } from "@/components/botao-censo";

const normal = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function Catalogo({ startups, link }: { startups: StartupPublica[]; link: string }) {
  const [vertical, setVertical] = useState("");
  const [fase, setFase] = useState("");
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    const q = normal(busca.trim());
    return startups.filter(
      (s) =>
        (!vertical || (vertical === "agrofoodtech" ? ehAgroFood(s.vertical) : s.vertical === vertical)) &&
        (!fase || s.fase === fase) &&
        (!q || normal(`${s.nome} ${s.vertical ?? ""}`).includes(q)),
    );
  }, [startups, vertical, fase, busca]);

  const verticaisPresentes = VERTICAIS.filter((v) => startups.some((s) => s.vertical === v));
  const temFiltro = vertical || fase || busca;
  const campo =
    "h-11 rounded-xl border border-fio-forte bg-fundo-2 px-3 text-sm text-texto outline-none focus:border-verde";

  if (!startups.length) {
    return (
      <div className="rounded-2xl border border-dashed border-fio-forte p-8 text-center sm:p-12">
        <p className="font-display text-2xl font-semibold text-texto">A vitrine abre com as primeiras respostas.</p>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed">
          Nenhuma startup foi publicada ainda. Quem responde ao Censo e autoriza aparecer aqui entra na vitrine depois da
          revisão da equipe do Observatório.
        </p>
        <div className="mt-6 flex justify-center">
          <BotaoCenso href={link} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" role="search">
        <label className="relative flex-1 sm:min-w-64">
          <span className="sr-only">Buscar por nome</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fraco" aria-hidden />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou palavra-chave"
            className={`${campo} w-full pl-9`}
          />
        </label>
        <label>
          <span className="sr-only">Vertical</span>
          <select value={vertical} onChange={(e) => setVertical(e.target.value)} className={`${campo} w-full`}>
            <option value="">Todas as verticais</option>
            <option value="agrofoodtech">AgroFoodTech (Agro + Food)</option>
            {verticaisPresentes.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Fase</span>
          <select value={fase} onChange={(e) => setFase(e.target.value)} className={`${campo} w-full`}>
            <option value="">Todas as fases</option>
            {FASES.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        {temFiltro && (
          <button
            onClick={() => (setBusca(""), setVertical(""), setFase(""))}
            className="inline-flex h-11 items-center gap-1.5 px-2 text-sm text-fraco hover:text-texto"
          >
            <X className="size-4" /> Limpar
          </button>
        )}
      </div>
      <p className="mt-4 text-sm text-fraco" aria-live="polite">
        {filtradas.length} de {startups.length} startups
      </p>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtradas.map((s) => {
          const agro = ehAgroFood(s.vertical);
          return (
            <li
              key={s.id}
              className={`group flex flex-col rounded-2xl border p-5 transition-colors hover:border-verde/60 ${
                agro ? "border-verde/35 bg-verde/[0.05]" : "border-fio bg-fundo-2/70"
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {s.vertical && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      agro ? "bg-verde text-tinta" : "bg-fio/60 text-texto"
                    }`}
                  >
                    {s.vertical}
                  </span>
                )}
                {s.fase && <span className="rounded-full border border-fio-forte px-2.5 py-1 text-xs">{s.fase}</span>}
              </div>
              <div className="mt-4 flex items-center gap-3">
                {s.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logo_url} alt="" className="size-12 shrink-0 rounded-xl bg-white object-contain p-1.5" loading="lazy" />
                )}
                <h2 className="font-display text-xl font-semibold text-texto">{s.nome}</h2>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {s.site && <Elo href={s.site} rotulo="Site" nome={s.nome} />}
                {s.instagram && <Elo href={s.instagram} rotulo="Instagram" nome={s.nome} />}
                {s.linkedin && <Elo href={s.linkedin} rotulo="LinkedIn" nome={s.nome} />}
              </div>
            </li>
          );
        })}
      </ul>
      {!filtradas.length && <p className="mt-8 text-center text-sm text-fraco">Nenhuma startup com esses filtros.</p>}
    </>
  );
}

function Elo({ href, rotulo, nome }: { href: string; rotulo: string; nome: string }) {
  const url = /^https?:\/\//.test(href) ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener nofollow"
      aria-label={`${rotulo} de ${nome}`}
      className="inline-flex h-9 items-center gap-1 rounded-full border border-fio-forte px-3 text-xs font-medium text-corpo hover:border-verde hover:text-verde"
    >
      {rotulo} <ArrowUpRight className="size-3.5" aria-hidden />
    </a>
  );
}
