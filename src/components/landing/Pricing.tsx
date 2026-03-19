import Link from "next/link";
import { Check, ArrowRight, Sparkles, Crown } from "lucide-react";

const freePlan = {
  name: "Gratuito",
  price: "0",
  unit: "per sempre",
  features: ["1 operazione completa", "Tutte e 3 le aree di analisi", "Calcoli e indicatori", "Dashboard personale", "Report PDF base"],
  cta: "Registrati gratis",
  href: "/register",
  style: "border",
};

const payPlan = {
  name: "Pay-per-plan",
  price: "3",
  unit: "per operazione",
  tag: "Popolare",
  features: ["Operazioni illimitate", "Tutte e 3 le aree di analisi", "Calcoli e indicatori completi", "Report PDF professionali", "Duplicazione operazioni", "Archivio completo"],
  cta: "Inizia ora",
  href: "/register",
};

const premiumPlan = {
  name: "Premium",
  price: "10",
  unit: "€/mese",
  features: ["Tutto di Pay-per-plan", "Operazioni illimitate incluse", "Scenari multipli", "Confronto tra operazioni", "Monitoraggio previsto vs reale", "Grafici avanzati di sensibilità"],
  cta: "Prova Premium",
  href: "/register",
};

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0e1e 0%, #0d1224 100%)" }}
    >
      {/* Blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Prezzi</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 tracking-tight">
            Semplici e{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #60a5fa, #c084fc)" }}
            >
              trasparenti
            </span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Inizia gratis. Paga solo quando hai bisogno di più.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div
            className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{freePlan.name}</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-extrabold text-white tracking-tight">{freePlan.price}</span>
              <span className="text-xl text-slate-400 font-semibold">€</span>
            </div>
            <p className="text-sm text-slate-500 mb-8 font-medium">{freePlan.unit}</p>
            <div className="space-y-3.5 mb-8">
              {freePlan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(5,150,105,0.15)", border: "1px solid rgba(5,150,105,0.3)" }}>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
            <Link
              href={freePlan.href}
              className="block w-full text-center py-3 rounded-xl text-white font-semibold text-sm transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {freePlan.cta}
            </Link>
          </div>

          {/* Pay-per-plan (featured) */}
          <div
            className="relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-blue-500/20"
            style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(79,70,229,0.12) 100%)", border: "1px solid rgba(99,102,241,0.4)" }}
          >
            {/* Popular badge */}
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              <Sparkles className="w-3 h-3" />
              Popolare
            </div>

            <p className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">{payPlan.name}</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-extrabold text-white tracking-tight">{payPlan.price}</span>
              <span className="text-xl text-slate-400 font-semibold">€</span>
            </div>
            <p className="text-sm text-slate-400 mb-8 font-medium">{payPlan.unit}</p>
            <div className="space-y-3.5 mb-8">
              {payPlan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)" }}>
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="text-slate-200 text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
            <Link
              href={payPlan.href}
              className="group flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-blue-500/25"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              {payPlan.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-center text-xs text-slate-500 mt-3 font-medium">Pagamento sicuro con Stripe</p>
          </div>

          {/* Premium */}
          <div
            className="relative rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg, #1c1128 0%, #0f1629 100%)", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-bold text-amber-400 uppercase tracking-wider">{premiumPlan.name}</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold text-white tracking-tight">{premiumPlan.price}</span>
                <span className="text-xl text-slate-400 font-semibold">€/mese</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 font-medium">cancella quando vuoi</p>
              <div className="space-y-3.5 mb-8">
                {premiumPlan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href={premiumPlan.href}
                className="block w-full text-center py-3 rounded-xl font-bold text-sm text-slate-900 transition-all duration-200 hover:brightness-110 shadow-lg shadow-amber-500/25"
                style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
              >
                {premiumPlan.cta}
              </Link>
              <p className="text-center text-xs text-slate-600 mt-3 font-medium">Pagamento sicuro con Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
