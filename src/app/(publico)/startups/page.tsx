import type { Metadata } from "next";
import { ConviteCenso, Pagina, TopoAba } from "@/components/ui";
import { carregarBase } from "@/lib/server/dados";
import type { StartupPublica } from "@/lib/tipos";
import { Catalogo } from "./catalogo";

export const metadata: Metadata = { title: "Startups" };

export default async function Startups() {
  const { parametros: p, startups } = await carregarBase();

  // Só atravessa para o navegador quem consentiu, e só os campos mínimos.
  const vitrine: StartupPublica[] = startups
    .filter((s) => s.consentiu_vitrine)
    .map((s) => ({
      id: s.id,
      nome: s.nome,
      vertical: s.vertical,
      fase: s.fase,
      site: s.publico_site ? s.site : null,
      instagram: s.publico_instagram ? s.instagram : null,
      linkedin: s.publico_linkedin ? s.linkedin : null,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <Pagina>
      <TopoAba
        elemento="pontos"
        rotulo="Vitrine de startups"
        titulo={
          <>
            Quem está construindo o <em>Vale dos Ipês</em>.
          </>
        }
        intro="As startups que responderam ao Censo e autorizaram aparecer aqui. Filtre por vertical e fase, ou procure pelo nome. Números de cada empresa não são publicados: eles entram só nos gráficos agregados."
      />
      <Catalogo startups={vitrine} link={p.link_formulario} />
      <ConviteCenso
        link={p.link_formulario}
        texto="Responda ao Censo e marque a autorização para entrar na vitrine. Aparecem só nome, vertical, fase e os links que você indicar."
      />
    </Pagina>
  );
}
