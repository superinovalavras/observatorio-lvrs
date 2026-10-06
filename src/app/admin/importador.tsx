"use client";

import { useState, useTransition } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { readSheet } from "read-excel-file/browser";
import { importarRespostas } from "@/lib/server/acoes";
import { lerCsv } from "@/lib/importacao";
import { Aviso, CartaoAdmin } from "@/components/admin/ui";

export function Importador() {
  const [pendente, iniciar] = useTransition();
  const [retorno, setRetorno] = useState<{ ok: boolean; texto: string } | null>(null);

  async function ler(f: File) {
    setRetorno(null);
    let linhas: string[][];
    try {
      linhas = /\.csv$/i.test(f.name)
        ? lerCsv(await f.text())
        : ((await readSheet(f)) as unknown[][]).map((l) => l.map((c) => (c == null ? "" : c instanceof Date ? c.toLocaleString("pt-BR") : String(c))));
    } catch {
      setRetorno({ ok: false, texto: "Não consegui ler o arquivo. Use .xlsx ou .csv baixado da planilha de respostas." });
      return;
    }
    const [cab, ...corpo] = linhas;
    if (!cab?.length) return setRetorno({ ok: false, texto: "A planilha está vazia." });
    const objetos = corpo.map((l) => Object.fromEntries(cab.map((c, i) => [c.trim(), (l[i] ?? "").trim()])));
    iniciar(async () => {
      const r = await importarRespostas(objetos);
      setRetorno(r?.ok ? { ok: true, texto: r.msg ?? "Importado." } : { ok: false, texto: r?.erro ?? "Erro ao importar." });
    });
  }

  return (
    <CartaoAdmin>
      <div className="flex flex-wrap items-center gap-5">
        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-verde px-5 text-sm font-semibold text-tinta hover:brightness-95">
          {pendente ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
          Importar planilha de respostas
          <input
            type="file"
            accept=".xlsx,.csv"
            className="sr-only"
            disabled={pendente}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) ler(f);
              e.target.value = "";
            }}
          />
        </label>
        <p className="max-w-xl text-xs leading-relaxed text-slate-500">
          Na planilha do Google Form: <b>Arquivo › Fazer download › Microsoft Excel (.xlsx)</b> ou <b>CSV</b>. Pode importar
          a planilha inteira sempre: respostas que já estão aqui são ignoradas.
        </p>
      </div>
      {retorno && (
        <div className="mt-4">
          <Aviso tom={retorno.ok ? "ok" : "erro"}>{retorno.texto}</Aviso>
        </div>
      )}
    </CartaoAdmin>
  );
}
