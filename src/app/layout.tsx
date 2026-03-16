import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Impresius - Business Plan Immobiliare",
  description:
    "Crea business plan professionali per i tuoi investimenti immobiliari. Analisi dettagliate, metriche di rendimento e proiezioni finanziarie.",
  keywords: [
    "business plan immobiliare",
    "investimento immobiliare",
    "analisi rendimento",
    "real estate investment",
    "piano economico",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
