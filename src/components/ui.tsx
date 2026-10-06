import type { ReactNode } from "react";
import type { Fatia } from "@/lib/agregados";
import { fmtInt } from "@/lib/agregados";
import { BotaoCenso } from "./botao-censo";

export function Pagina({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1240px] px-4 pb-24 sm:px-8">{children}</div>;
}

/**
 * Elementos da identidade do Observatório (ver memória "elementos gráficos"): cada um tem sentido.
 * irradia = alcance, varredura · pontos = muitas unidades formando o ecossistema ·
 * setas = progressão em etapas · ondas = variação ao longo do tempo · hachura = área marcada.
 */
type Elemento = "irradia" | "pontos" | "setas" | "ondas" | "hachura";

/** Topo de cada aba: rótulo, título com a palavra-chave em verde, e a frase que diz para que a aba serve. */
export function TopoAba({
  rotulo,
  titulo,
  intro,
  elemento,
  children,
}: {
  rotulo: string;
  titulo: ReactNode;
  intro: ReactNode;
  elemento?: Elemento;
  children?: ReactNode;
}) {
  return (
    <section className="relative pb-10 pt-12 sm:pt-16">
      <div className="malha pointer-events-none absolute inset-x-0 -top-4 h-72" aria-hidden />
      {elemento && (
        // Textura grande a ~17% (calibrada na v1), só em tela larga, fora da coluna de texto.
        <img
          src={`/assets/elementos/${elemento}.png`}
          alt=""
          aria-hidden
          className={`elemento pointer-events-none absolute right-0 top-6 hidden opacity-[0.17] lg:block ${
            elemento === "setas" ? "h-80 w-auto" : elemento === "hachura" || elemento === "ondas" ? "w-[420px]" : "w-[360px]"
          }`}
        />
      )}
      <div className="relative">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-verde">
          <span className="size-1.5 rounded-full bg-verde" aria-hidden />
          {rotulo}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-[34px] font-semibold leading-[1.08] tracking-tight text-texto sm:text-5xl [&_em]:not-italic [&_em]:text-verde">
          {titulo}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">{intro}</p>
        {children}
      </div>
    </section>
  );
}

export function Secao({ titulo, sub, children, className = "" }: { titulo: string; sub?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`mt-14 ${className}`}>
      <h2 className="font-display text-xl font-semibold text-texto sm:text-2xl">{titulo}</h2>
      {sub && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fraco">{sub}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Cartao({ children, className = "", destaque = false }: { children: ReactNode; className?: string; destaque?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${destaque ? "border-verde/50 bg-verde/[0.06]" : "border-fio bg-fundo-2/70"} ${className}`}>
      {children}
    </div>
  );
}

/** Número de destaque. `oculto` = grupo pequeno demais para publicar (sigilo). */
export function Kpi({
  rotulo,
  valor,
  detalhe,
  oculto,
  k,
  atraso = 0,
}: {
  rotulo: string;
  valor: ReactNode;
  detalhe?: ReactNode;
  oculto?: boolean;
  k?: number;
  atraso?: number;
}) {
  return (
    <Cartao>
      <p className="text-[13px] font-medium text-fraco">{rotulo}</p>
      <p className="surge mt-2 font-display text-3xl font-semibold tabular-nums text-texto sm:text-4xl" style={{ animationDelay: `${atraso}ms` }}>
        {oculto ? <span className="text-fraco">—</span> : valor}
      </p>
      <p className="mt-1.5 text-[13px] leading-snug text-fraco">
        {oculto ? `Publicado quando houver ${k ?? 3} ou mais startups no recorte.` : detalhe}
      </p>
    </Cartao>
  );
}

/**
 * Barras horizontais de uma série só (sem legenda: o título da seção nomeia a série).
 * Fatias com menos de k startups não mostram número nem barra — mostram "menos de k".
 */
export function Barras({
  fatias,
  k,
  base,
  unidade = "startups",
  rotulo,
}: {
  fatias: Fatia[];
  k: number;
  /** Total para o percentual; se omitido, usa a soma das fatias. */
  base?: number;
  unidade?: string;
  rotulo?: (r: string) => string;
}) {
  const total = base ?? fatias.reduce((a, f) => a + f.n, 0);
  const maior = Math.max(1, ...fatias.filter((f) => !f.oculto).map((f) => f.n));
  const algumaOculta = fatias.some((f) => f.oculto);

  return (
    <figure>
      <ul className="space-y-2.5">
        {fatias.map((f, i) => {
          const pct = total ? Math.round((f.n / total) * 100) : 0;
          const nome = rotulo ? rotulo(f.rotulo) : f.rotulo;
          return (
            <li
              key={f.rotulo}
              className="group grid grid-cols-[minmax(0,11rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,15rem)_1fr]"
              title={f.oculto ? `${nome}: menos de ${k} ${unidade}` : `${nome}: ${fmtInt(f.n)} ${unidade} (${pct}%)`}
            >
              <span className="truncate text-sm text-corpo group-hover:text-texto">{nome}</span>
              <span className="flex items-center gap-3">
                <span className="relative h-3 flex-1 rounded-full bg-fio/40">
                  {!f.oculto && f.n > 0 && (
                    <span
                      className="barra absolute inset-y-0 left-0 rounded-full bg-verde/85 group-hover:bg-verde"
                      style={{ width: `${(f.n / maior) * 100}%`, animationDelay: `${i * 45}ms` }}
                    />
                  )}
                </span>
                <span className="w-24 shrink-0 text-right text-sm tabular-nums text-texto">
                  {f.oculto ? <span className="text-xs text-fraco">menos de {k}</span> : f.n === 0 ? <span className="text-fraco">0</span> : <>
                    {fmtInt(f.n)} <span className="text-xs text-fraco">· {pct}%</span>
                  </>}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      {algumaOculta && (
        <figcaption className="mt-4 text-xs leading-relaxed text-fraco">
          Recortes com menos de {k} startups não têm o número publicado, para que nenhuma empresa seja identificável.
        </figcaption>
      )}
    </figure>
  );
}

/** Colunas verticais para faixas ordenadas (faturamento, clientes): a forma de um histograma. */
export function Colunas({ fatias, k, rotulo }: { fatias: Fatia[]; k: number; rotulo?: (r: string) => string }) {
  const total = fatias.reduce((a, f) => a + f.n, 0);
  const maior = Math.max(1, ...fatias.filter((f) => !f.oculto).map((f) => f.n));
  return (
    <figure>
      <div className="flex h-56 items-end gap-1.5 border-b border-fio-forte sm:gap-2.5">
        {fatias.map((f, i) => {
          const nome = rotulo ? rotulo(f.rotulo) : f.rotulo;
          const pct = total ? Math.round((f.n / total) * 100) : 0;
          return (
            <div
              key={f.rotulo}
              className="group relative flex h-full flex-1 flex-col justify-end"
              title={f.oculto ? `${nome}: menos de ${k}` : `${nome}: ${f.n} startups (${pct}%)`}
            >
              <span className="mb-1 text-center text-[11px] tabular-nums text-texto sm:text-xs">
                {f.oculto ? <span className="text-fraco">&lt;{k}</span> : f.n > 0 ? f.n : ""}
              </span>
              {!f.oculto && f.n > 0 ? (
                <span
                  className="coluna block rounded-t-[4px] bg-verde/80 group-hover:bg-verde"
                  style={{ height: `${(f.n / maior) * 82}%`, animationDelay: `${i * 60}ms` }}
                />
              ) : (
                <span className="block h-px" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2.5">
        {fatias.map((f) => (
          <span key={f.rotulo} className="flex-1 text-center text-[10px] leading-tight text-fraco sm:text-[11px]">
            {rotulo ? rotulo(f.rotulo) : f.rotulo}
          </span>
        ))}
      </div>
      {fatias.some((f) => f.oculto) && (
        <figcaption className="mt-4 text-xs text-fraco">“&lt;{k}”: menos de {k} startups, número não publicado.</figcaption>
      )}
    </figure>
  );
}

/**
 * Partes de um todo ordenadas (ex.: folga → risco → sem caixa): uma barra só, em
 * tons de um mesmo verde, do mais forte ao mais fraco. Legenda sempre presente.
 * Se alguma parte tiver menos de k, a barra inteira não é publicada.
 */
export function PartesDoTodo({ fatias, k, rotulo }: { fatias: Fatia[]; k: number; rotulo?: (r: string) => string }) {
  const total = fatias.reduce((a, f) => a + f.n, 0);
  const tons = ["bg-verde", "bg-verde/55", "bg-verde/25", "bg-verde/10"];
  if (!total) return <p className="text-sm text-fraco">Sem respostas neste recorte.</p>;
  if (fatias.some((f) => f.oculto))
    return (
      <p className="text-sm leading-relaxed text-fraco">
        Uma das partes tem menos de {k} startups. A divisão é publicada quando todas tiverem {k} ou mais.
      </p>
    );
  return (
    <figure>
      <div className="revela flex h-10 gap-[2px] overflow-hidden rounded-full">
        {fatias.map((f, i) =>
          f.n > 0 ? (
            <span
              key={f.rotulo}
              className={`${tons[i]} h-full`}
              style={{ width: `${(f.n / total) * 100}%` }}
              title={`${rotulo ? rotulo(f.rotulo) : f.rotulo}: ${f.n} (${Math.round((f.n / total) * 100)}%)`}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-5 space-y-2.5">
        {fatias.map((f, i) => (
          <li key={f.rotulo} className="flex items-center gap-3 text-sm">
            <span className={`size-3 shrink-0 rounded-sm border border-verde/50 ${tons[i]}`} aria-hidden />
            <span className="flex-1">{rotulo ? rotulo(f.rotulo) : f.rotulo}</span>
            <span className="tabular-nums text-texto">
              {Math.round((f.n / total) * 100)}% <span className="text-xs text-fraco">· {f.n}</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** O que a aba mostra antes do 1º ciclo fechar: o instrumento ligado, esperando as respostas. */
export function AguardandoCiclo({
  ciclo,
  respostas,
  link,
  oQueVaiAparecer,
}: {
  ciclo: string;
  respostas: number;
  link: string;
  oQueVaiAparecer: string[];
}) {
  return (
    <Cartao className="relative overflow-hidden">
      <div className="grid items-center gap-8 md:grid-cols-[180px_1fr]">
        <svg viewBox="0 0 120 120" className="mx-auto w-32 md:w-full" aria-hidden>
          {[50, 36, 22].map((r) => (
            <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="var(--fio-forte)" strokeWidth="1" />
          ))}
          <g className="varredura">
            <path d="M60 60 L60 10 A50 50 0 0 1 103 35 Z" fill="var(--verde)" opacity="0.16" />
            <line x1="60" y1="60" x2="60" y2="10" stroke="var(--verde)" strokeWidth="1.5" />
          </g>
          <circle cx="60" cy="60" r="3" fill="var(--verde)" />
        </svg>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-verde">Aguardando o ciclo {ciclo}</p>
          <p className="mt-3 font-display text-2xl font-semibold leading-snug text-texto">
            Estes números saem das respostas das startups. O ciclo ainda está aberto.
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            {respostas > 0 ? (
              <>
                <b className="text-texto">{fmtInt(respostas)} {respostas === 1 ? "startup já respondeu" : "startups já responderam"}</b>. Os
                gráficos são publicados quando o ciclo fecha.
              </>
            ) : (
              <>Nenhuma resposta foi publicada ainda. Os gráficos aparecem quando o ciclo fechar.</>
            )}{" "}
            Quando publicar, esta aba vai mostrar:
          </p>
          <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {oQueVaiAparecer.map((x) => (
              <li key={x} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-verde/70" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <BotaoCenso href={link} />
            <span className="text-sm text-fraco">50 a 60 min · dá para responder por partes</span>
          </div>
        </div>
      </div>
    </Cartao>
  );
}

/** Faixa curta de convite no fim de cada aba. */
export function ConviteCenso({ link, texto }: { link: string; texto: string }) {
  return (
    <section className="mt-20 flex flex-col items-start gap-5 rounded-2xl border border-verde/40 bg-gradient-to-r from-verde/[0.10] to-transparent p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <p className="font-display text-xl font-semibold text-texto sm:text-2xl">Sua startup é de Lavras?</p>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed">{texto}</p>
      </div>
      <BotaoCenso href={link} tamanho="lg" className="shrink-0" />
    </section>
  );
}

export function Fonte({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs leading-relaxed text-fraco">{children}</p>;
}
