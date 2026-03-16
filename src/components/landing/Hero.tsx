import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

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
            La piattaforma #1 per investitori immobiliari
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 animate-fade-in-up">
            Il tuo{" "}
            <span className="text-gradient">Business Plan</span>
            <br />
            immobiliare in minuti
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Analizza investimenti, calcola rendimenti e prendi decisioni informate
            con il tool professionale usato da operatori immobiliari di successo.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/register">
              <Button variant="gradient" size="xl" className="group">
                Crea il tuo primo piano
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
              <span className="text-sm font-medium">Analisi professionali</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Dati sicuri e protetti</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">Risultati istantanei</span>
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
                  <span className="text-xs text-gray-500">app.impresius.com/dashboard</span>
                </div>
              </div>
              {/* Dashboard mockup */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
                  <p className="text-blue-200 text-xs">ROI Medio</p>
                  <p className="text-white text-2xl font-bold mt-1">12.4%</p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4">
                  <p className="text-green-200 text-xs">Cash Flow</p>
                  <p className="text-white text-2xl font-bold mt-1">+840/m</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-4">
                  <p className="text-indigo-200 text-xs">Cap Rate</p>
                  <p className="text-white text-2xl font-bold mt-1">7.2%</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4">
                  <p className="text-purple-200 text-xs">Piani Attivi</p>
                  <p className="text-white text-2xl font-bold mt-1">8</p>
                </div>
              </div>
              {/* Chart mockup */}
              <div className="mt-4 bg-gray-800 rounded-lg p-4 h-48 flex items-end gap-2">
                {[40, 55, 45, 60, 75, 65, 80, 70, 85, 90, 82, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm opacity-80" style={{ height: `${h}%` }} />
                ))}
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
