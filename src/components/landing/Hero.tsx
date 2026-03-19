import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, Calculator, FileText } from "lucide-react";

const kpis = [
  { label: "Margine Lordo", value: "+372K", sub: "51.7% ROI", color: "from-emerald-600 to-emerald-700" },
  { label: "Ricavo Totale", value: "720K €", sub: "3 unità", color: "from-blue-600 to-blue-700" },
  { label: "Costo Totale",  value: "348K €", sub: "Acq + Lavori + Op.", color: "from-violet-600 to-violet-700" },
];

const trustBadges = [
  { icon: TrendingUp, text: "ROI & Margini istantanei" },
  { icon: Shield, text: "Dati sicuri e privati" },
  { icon: Zap, text: "Calcoli in tempo reale" },
];

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0e1e 0%, #0f172a 40%, #1a0b2e 100%)" }}
    >
      {/* Animated blobs */}
      <div className="absolute -top-40 -left-32 w-[500px] h-[500px] rounded-full opacity-20 animate-pulse pointer-events-none"
           style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] rounded-full opacity-15 animate-pulse pointer-events-none"
           style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", filter: "blur(80px)", animationDelay: "1s" }} />
      <div className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] rounded-full opacity-15 animate-pulse pointer-events-none"
           style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)", filter: "blur(80px)", animationDelay: "2s" }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-blue-300 mb-10 animate-fade-in"
            style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.3)" }}
          >
            <Zap className="w-3.5 h-3.5" />
            Piattaforma professionale per operatori immobiliari
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 animate-fade-in-up leading-[1.06]">
            Smetti di indovinare.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #60a5fa, #c084fc, #818cf8)" }}
            >
              Inizia a calcolare.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Computo metrico, stima valori, analisi costi e margini, report per le banche.
            Tutto in un&apos;unica piattaforma. In 20 minuti, non 3 ore.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              Crea la tua prima operazione gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-2xl text-slate-300 font-semibold text-base transition-all duration-200 hover:text-white hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Scopri come funziona
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-10 mt-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {trustBadges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-slate-400">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="mt-24 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div
            className="rounded-2xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
            style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ background: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="flex-1 ml-4 h-6 rounded-lg flex items-center px-3" style={{ background: "#0d1117" }}>
                <span className="text-xs text-slate-500 font-mono">app.impresius.com/plans/sintesi</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* KPI row */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {kpis.map((k) => (
                  <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-xl p-4 shadow-lg`}>
                    <p className="text-white/70 text-[0.65rem] font-bold uppercase tracking-wider mb-1">{k.label}</p>
                    <p className="text-white text-2xl font-extrabold tracking-tight">{k.value}</p>
                    <p className="text-white/60 text-xs font-medium mt-1">{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Cost bar */}
              <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Composizione Costi</span>
                </div>
                <div className="h-6 rounded-full overflow-hidden flex">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full" style={{ width: "56%" }} />
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full" style={{ width: "16%" }} />
                  <div className="bg-gradient-to-r from-violet-500 to-violet-400 h-full" style={{ width: "28%" }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-blue-400 font-medium">Acquisizione 56%</span>
                  <span className="text-xs text-amber-400 font-medium">Operativi 16%</span>
                  <span className="text-xs text-violet-400 font-medium">Lavori 28%</span>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Calculator, label: "Computo PT", value: "46.636 €", sub: "41 voci" },
                  { icon: Calculator, label: "Computo P2", value: "24.823 €", sub: "21 voci" },
                  { icon: FileText, label: "Report PDF", value: "Professionale", sub: "Esportabile" },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[0.65rem] text-slate-500 font-semibold">{label}</span>
                    </div>
                    <p className="text-white font-extrabold text-base">{value}</p>
                    <p className="text-slate-600 text-xs font-medium">{sub}</p>
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
