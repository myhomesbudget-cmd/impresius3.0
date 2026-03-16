import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap, Calculator, BarChart3, FileText } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />
            Piattaforma professionale per operatori immobiliari
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 animate-fade-in-up">
            Analisi e gestione{" "}
            <span className="text-gradient">operazioni immobiliari</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Valuta la sostenibilita economica delle tue operazioni immobiliari.
            Computo metrico, stima valori, analisi margini e report professionali
            in un&apos;unica piattaforma.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/register">
              <Button variant="gradient" size="xl" className="group">
                Crea la tua prima operazione gratis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="xl">
                Scopri come funziona
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2 text-gray-500">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Margini e ROI istantanei</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Dati sicuri e protetti</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">Calcoli in tempo reale</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 p-1">
            <div className="bg-gray-900 rounded-xl p-6">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 ml-4 h-7 bg-gray-800 rounded-md flex items-center px-3">
                  <span className="text-xs text-gray-500">app.impresius.com/plans/sintesi</span>
                </div>
              </div>
              {/* Mockup: Sintesi Operazione */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4">
                  <p className="text-green-200 text-xs">Margine Lordo</p>
                  <p className="text-white text-2xl font-bold mt-1">+372K</p>
                  <p className="text-green-300 text-xs mt-1">51.7% ROI</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
                  <p className="text-blue-200 text-xs">Ricavo Totale</p>
                  <p className="text-white text-2xl font-bold mt-1">720K</p>
                  <p className="text-blue-300 text-xs mt-1">3 unita</p>
                </div>
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-4">
                  <p className="text-amber-200 text-xs">Costo Totale</p>
                  <p className="text-white text-2xl font-bold mt-1">348K</p>
                  <p className="text-amber-300 text-xs mt-1">Acq + Lavori + Op.</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-4">
                  <p className="text-indigo-200 text-xs">Costo/mq</p>
                  <p className="text-white text-2xl font-bold mt-1">1.420</p>
                  <p className="text-indigo-300 text-xs mt-1">245 mq ragg.</p>
                </div>
              </div>
              {/* Cost breakdown mockup */}
              <div className="mt-4 bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400 font-medium">Composizione Costi</span>
                </div>
                <div className="h-6 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full" style={{ width: "56%" }} />
                  <div className="bg-amber-500 h-full" style={{ width: "16%" }} />
                  <div className="bg-emerald-500 h-full" style={{ width: "28%" }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-blue-400">Acquisizione 56%</span>
                  <span className="text-xs text-amber-400">Operativi 16%</span>
                  <span className="text-xs text-emerald-400">Lavori 28%</span>
                </div>
              </div>
              {/* Computo preview */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">Computo PT</span>
                  </div>
                  <p className="text-white font-bold">46.636</p>
                  <p className="text-gray-500 text-xs">41 voci</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">Computo P2</span>
                  </div>
                  <p className="text-white font-bold">24.823</p>
                  <p className="text-gray-500 text-xs">21 voci</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">Report PDF</span>
                  </div>
                  <p className="text-white font-bold text-sm">Professionale</p>
                  <p className="text-gray-500 text-xs">Esportabile</p>
                </div>
              </div>
            </div>
          </div>
          {/* Gradient overlay at bottom */}
          <div className="absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}
