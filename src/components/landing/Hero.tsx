import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap, Calculator, BarChart3, FileText } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-card/80 border border-primary/20 text-primary text-sm font-semibold mb-10 animate-fade-in shadow-[0_2px_8px_hsl(var(--primary)/0.1)]">
            <Zap className="w-4 h-4" />
            Piattaforma professionale per operatori immobiliari
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-8 animate-fade-in-up leading-[1.08]">
            Analisi e gestione{" "}
            <span className="text-gradient">operazioni immobiliari</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Valuta la sostenibilita economica delle tue operazioni immobiliari.
            Computo metrico, stima valori, analisi margini e report professionali
            in un&apos;unica piattaforma.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/register">
              <Button variant="gradient" size="xl" className="group gap-2">
                Crea la tua prima operazione gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="xl">
                Scopri come funziona
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-10 mt-20 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <div className="icon-container icon-container-sm rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-semibold">Margini e ROI istantanei</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <div className="icon-container icon-container-sm rounded-lg bg-primary/10">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold">Dati sicuri e protetti</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <div className="icon-container icon-container-sm rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-semibold">Calcoli in tempo reale</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-24 relative animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-[0_20px_60px_rgb(0_0_0/0.25)] overflow-hidden border border-slate-700/50 p-1.5">
            <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="flex-1 ml-4 h-7 bg-slate-800 rounded-lg flex items-center px-3">
                  <span className="text-xs text-slate-500 font-medium">app.impresius.com/plans/sintesi</span>
                </div>
              </div>
              {/* Mockup: Sintesi Operazione */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 shadow-lg">
                  <p className="text-emerald-200 text-[0.6875rem] font-semibold uppercase tracking-wide">Margine Lordo</p>
                  <p className="text-white text-2xl font-extrabold mt-1.5 tracking-tight">+372K</p>
                  <p className="text-emerald-300 text-xs font-medium mt-1">51.7% ROI</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 shadow-lg">
                  <p className="text-blue-200 text-[0.6875rem] font-semibold uppercase tracking-wide">Ricavo Totale</p>
                  <p className="text-white text-2xl font-extrabold mt-1.5 tracking-tight">720K</p>
                  <p className="text-blue-300 text-xs font-medium mt-1">3 unita</p>
                </div>
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-4 shadow-lg">
                  <p className="text-amber-200 text-[0.6875rem] font-semibold uppercase tracking-wide">Costo Totale</p>
                  <p className="text-white text-2xl font-extrabold mt-1.5 tracking-tight">348K</p>
                  <p className="text-amber-300 text-xs font-medium mt-1">Acq + Lavori + Op.</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4 shadow-lg">
                  <p className="text-indigo-200 text-[0.6875rem] font-semibold uppercase tracking-wide">Costo/mq</p>
                  <p className="text-white text-2xl font-extrabold mt-1.5 tracking-tight">1.420</p>
                  <p className="text-indigo-300 text-xs font-medium mt-1">245 mq ragg.</p>
                </div>
              </div>
              {/* Cost breakdown mockup */}
              <div className="mt-4 bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Composizione Costi</span>
                </div>
                <div className="h-7 rounded-full overflow-hidden flex shadow-inner">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full" style={{ width: "56%" }} />
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full" style={{ width: "16%" }} />
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full" style={{ width: "28%" }} />
                </div>
                <div className="flex justify-between mt-2.5">
                  <span className="text-xs text-blue-400 font-medium">Acquisizione 56%</span>
                  <span className="text-xs text-amber-400 font-medium">Operativi 16%</span>
                  <span className="text-xs text-emerald-400 font-medium">Lavori 28%</span>
                </div>
              </div>
              {/* Computo preview */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[0.6875rem] text-slate-400 font-semibold">Computo PT</span>
                  </div>
                  <p className="text-white font-extrabold text-lg">46.636</p>
                  <p className="text-slate-500 text-xs font-medium">41 voci</p>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[0.6875rem] text-slate-400 font-semibold">Computo P2</span>
                  </div>
                  <p className="text-white font-extrabold text-lg">24.823</p>
                  <p className="text-slate-500 text-xs font-medium">21 voci</p>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[0.6875rem] text-slate-400 font-semibold">Report PDF</span>
                  </div>
                  <p className="text-white font-extrabold text-sm">Professionale</p>
                  <p className="text-slate-500 text-xs font-medium">Esportabile</p>
                </div>
              </div>
            </div>
          </div>
          {/* Gradient overlay at bottom */}
          <div className="absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}
