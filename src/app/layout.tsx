import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://observatorio.lvrs.com.br"),
  title: {
    default: "Observatório VDI — dados do ecossistema de inovação de Lavras",
    template: "%s · Observatório VDI",
  },
  description:
    "Os números do ecossistema de inovação de Lavras, declarados pelas startups do Vale dos Ipês no Censo Semestral. Panorama, AgroFoodTech, startups, instituições, programas, tração e investimento.",
  openGraph: {
    type: "website",
    siteName: "Observatório VDI",
    locale: "pt_BR",
    images: ["/assets/logo.png"],
  },
  icons: {
    icon: [
      { url: "/assets/favicon-32.png", sizes: "32x32" },
      { url: "/assets/favicon.png", sizes: "180x180" },
    ],
    apple: "/assets/favicon.png",
  },
};

export const viewport: Viewport = { themeColor: "#0a2540" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${grotesk.variable}`}>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
