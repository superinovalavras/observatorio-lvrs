"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { entrar } from "@/lib/server/acoes";
import { Campo, btnPrim, inputCls } from "@/components/admin/ui";

export function FormEntrar({ erroInicial }: { erroInicial?: string }) {
  const [estado, acao, pendente] = useActionState(entrar, undefined);
  const erro = estado && !estado.ok ? estado.erro : erroInicial;
  return (
    <form action={acao} className="mt-6 space-y-4">
      <Campo rotulo="E-mail">
        <input name="email" type="email" autoComplete="email" required className={inputCls} />
      </Campo>
      <Campo rotulo="Senha">
        <input name="senha" type="password" autoComplete="current-password" required className={inputCls} />
      </Campo>
      {erro && <p className="text-sm text-red-700">{erro}</p>}
      <button className={`${btnPrim} w-full`} disabled={pendente}>
        {pendente && <Loader2 className="size-4 animate-spin" />} Entrar
      </button>
    </form>
  );
}
