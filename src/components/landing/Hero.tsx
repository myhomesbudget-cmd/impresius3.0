import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, Calculator, FileText } from "lucide-react";

const kpis = [
  { label: "Margine Lordo", value: "+372K", sub: "51.7% ROI", color: "glass-accent-purple" },
  { label: "Ricavo Totale", value: "720K €", sub: "3 unità", color: "glass-accent-cyan" },
  { label: "Costo Totale", value: "348K €", sub: "Acq + Lavori + Op.", color: "glass-accent-pink" },
];

const trustBadges = [
  { icon: TrendingUp, text: "ROI & Margini istantanei" },
  { icon: Shield, text: "Dati sicuri e privati" },
  { icon: Zap, text: "Calcoli in tempo reale" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#7B61FF] mb-8 sm:mb-10 animate-fade-in glass-panel-static !rounded-full !py-2 !px-4 !shadow-none !border-[#7B61FF]/20">
            <Zap className="w-3.5 h-3.5" />
            Piattaforma professionale per operatori immobiliari
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-[#1A1A24] mb-6 sm:mb-8 animate-fade-in-up leading-[1.06]">
            Smetti di indovinare.{" "}
            <span className="text-gradient-glass">Inizia a calcolare.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-[#1A1A24]/50 max-w-2xl mx-auto mb-10 sm:mb-12 animate-fade-in-up leading-relaxed px-4"
            style={{ animationDelay: "0.1s" }}
          >
            Computo metrico, stima valori, analisi costi e margini, report per le banche.
            Tutto in un&apos;unica piattaforma. In 20 minuti, non 3 ore.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up px-4"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              href="/register"
              className="group btn-glass-primary flex items-center gap-2 px-8 py-4 text-base w-full sm:w-auto justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Crea la tua prima operazione gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="glass-panel-static !rounded-2xl px-8 py-4 text-[#1A1A24]/70 font-semibold text-base transition-all duration-200 hover:text-[#7B61FF] !shadow-none w-full sm:w-auto text-center"
            >
              Scopri come funziona
            </a>
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-10 mt-12 sm:mt-16 animate-fade-in px-4"
            style={{ animationDelay: "0.4s" }}
          >
            {trustBadges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#7B61FF]/10 border border-[#7B61FF]/15">
                  <Icon className="w-4 h-4 text-[#7B61FF]" />
                </div>
                <span className="text-sm font-semibold text-[#1A1A24]/60">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div
          className="mt-16 sm:mt-24 max-w-5xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="glass-panel-lg overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-[#1A1A24]/[0.06]">
              <div className="w-3 h-3 rounded-full bg-[#FF2D55]/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
              <div className="flex-1 ml-4 h-6 rounded-lg flex items-center px-3 bg-[#1A1A24]/[0.04]">
                <span className="text-xs text-[#1A1A24]/30 font-mono hidden sm:inline">
                  app.impresius.com/plans/sintesi
                </span>
              </div>
            </div>

            {/* Content — no nested backdrop-filter */}
            <div className="p-4 sm:p-6">
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                {kpis.map((k) => (
                  <div
                    key={k.label}
                    className={`rounded-2xl p-4 bg-white/60 border border-white/70 ${k.color}`}
                  >
                    <p className="text-[#1A1A24]/40 text-[0.65rem] font-bold uppercase tracking-wider mb-1">
                      {k.label}
                    </p>
                    <p className="text-[#1A1A24] text-2xl font-extrabold tracking-tight">
                      {k.value}
                    </p>
                    <p className="text-[#1A1A24]/35 text-xs font-medium mt-1">{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Cost bar */}
              <div className="rounded-2xl p-4 mb-4 bg-white/40 border border-white/60">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-[#1A1A24]/30" />
                  <span className="text-xs text-[#1A1A24]/40 font-semibold uppercase tracking-wide">
                    Composizione Costi
                  </span>
                </div>
                <div className="h-6 rounded-full overflow-hidden flex">
                  <div className="bg-[#7B61FF] h-full" style={{ width: "56%" }} />
                  <div className="bg-[#00C2FF] h-full" style={{ width: "16%" }} />
                  <div className="bg-[#FF2D55] h-full" style={{ width: "28%" }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#7B61FF] font-medium">Acquisizione 56%</span>
                  <span className="text-xs text-[#00C2FF] font-medium">Operativi 16%</span>
                  <span className="text-xs text-[#FF2D55] font-medium">Lavori 28%</span>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { icon: Calculator, label: "Computo PT", value: "46.636 €", sub: "41 voci" },
                  { icon: Calculator, label: "Computo P2", value: "24.823 €", sub: "21 voci" },
                  { icon: FileText, label: "Report PDF", value: "Professionale", sub: "Esportabile" },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div
                    key={label}
                    className="rounded-2xl p-3.5 bg-white/40 border border-white/60"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-3.5 h-3.5 text-[#1A1A24]/30" />
                      <span className="text-[0.65rem] text-[#1A1A24]/40 font-semibold">
                        {label}
                      </span>
                    </div>
                    <p className="text-[#1A1A24] font-extrabold text-base">{value}</p>
                    <p className="text-[#1A1A24]/30 text-xs font-medium">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
