import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impresius - Analisi Operazioni Immobiliari",
  description:
    "Piattaforma professionale di analisi, simulazione e gestione economica delle operazioni immobiliari. Computo metrico, stima valori, margini e report PDF.",
  keywords: [
    "operazione immobiliare",
    "business plan immobiliare",
    "computo metrico",
    "stima valore immobiliare",
    "investimento immobiliare",
    "analisi margini",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        {/* Global background image applied to all screens */}
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-bg-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
