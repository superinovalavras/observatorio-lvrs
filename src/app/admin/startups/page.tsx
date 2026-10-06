import Link from "next/link";
import { Eye, EyeOff, Plus } from "lucide-react";
import { servico } from "@/lib/server/sessao";
import { alternarStartup } from "@/lib/server/acoes";
import type { Startup } from "@/lib/tipos";
import { ehAgroFood } from "@/lib/censo";
import { Aviso, CartaoAdmin, TituloAdmin, btnPrim } from "@/components/admin/ui";

export default async function Startups({ searchParams }: PageProps<"/admin/startups">) {
  const { salvo } = await searchParams;
  const { data } = await servico().from("startups").select("*").order("nome");
  const startups = (data as Startup[]) ?? [];

  return (
    <>
      <TituloAdmin
        titulo="Startups"
        sub="As startups aprovadas. Inativas saem dos números; sem autorização, ficam fora da vitrine mas continuam nos agregados."
        acoes={
          <Link href="/admin/startups/nova" className={btnPrim}>
            <Plus className="size-4" /> Cadastrar manualmente
          </Link>
        }
      />
      {salvo && (
        <div className="mb-4">
          <Aviso tom="ok">Startup salva. O site já reflete a mudança.</Aviso>
        </div>
      )}
      <CartaoAdmin className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-papel-fio text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Startup</th>
              <th className="px-3 py-3 font-medium">Fase</th>
              <th className="px-3 py-3 font-medium">Ciclo</th>
              <th className="px-3 py-3 font-medium">Vitrine</th>
              <th className="px-3 py-3 font-medium">Nos números</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-papel-fio">
            {startups.map((s) => (
              <tr key={s.id}>
                <td className="flex items-center gap-3 px-5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-papel-fio bg-white">
                    {s.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo_url} alt="" className="max-h-full max-w-full object-contain p-0.5" />
                    )}
                  </span>
                  <Link href={`/admin/startups/${s.id}`} className="font-medium hover:underline">
                    {s.nome}
                  </Link>
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${
                      ehAgroFood(s.vertical) ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {s.vertical ?? "sem vertical"}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-600">{s.fase ?? "—"}</td>
                <td className="px-3 py-3 text-slate-600">{s.ciclo ?? "—"}</td>
                <td className="px-3 py-3">
                  <form action={alternarStartup.bind(null, s.id, "consentiu_vitrine", !s.consentiu_vitrine)}>
                    <button
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                        s.consentiu_vitrine ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}
                      title="Só marque se a startup autorizou no formulário"
                    >
                      {s.consentiu_vitrine ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      {s.consentiu_vitrine ? "Autorizada" : "Fora da vitrine"}
                    </button>
                  </form>
                </td>
                <td className="px-3 py-3">
                  <form action={alternarStartup.bind(null, s.id, "ativa", !s.ativa)}>
                    <button
                      className={`rounded-full px-2.5 py-1 text-xs ${s.ativa ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-500"}`}
                    >
                      {s.ativa ? "Ativa" : "Inativa"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!startups.length && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  Nenhuma startup ainda. Aprove respostas do Censo ou cadastre manualmente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CartaoAdmin>
    </>
  );
}
