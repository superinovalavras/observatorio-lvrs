import { ArrowUpRight } from "lucide-react";

// O convite para responder o Censo. Aparece no cabeçalho (sempre visível),
// na faixa de cada aba, nos estados vazios e fixo no rodapé do celular.
export function BotaoCenso({
  href,
  tamanho = "md",
  rotulo = "Responder o censo",
  className = "",
}: {
  href: string;
  tamanho?: "sm" | "md" | "lg";
  rotulo?: string;
  className?: string;
}) {
  const medidas = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-[15px]",
    lg: "h-14 px-8 text-base",
  }[tamanho];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`convite inline-flex items-center justify-center gap-2 rounded-full bg-verde font-display font-semibold text-tinta transition-transform hover:-translate-y-0.5 ${medidas} ${className}`}
    >
      {rotulo}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}
