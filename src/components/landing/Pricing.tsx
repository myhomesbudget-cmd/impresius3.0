import Link from "next/link";
import { Check, ArrowRight, Sparkles, Crown } from "lucide-react";

const freePlan = {
  name: "Gratuito",
  price: "0",
  unit: "per sempre",
  features: [
    "1 operazione completa",
    "Tutte e 3 le aree di analisi",
    "Calcoli e indicatori",
    "Dashboard personale",
    "Report PDF base",
  ],
  cta: "Registrati gratis",
  href: "/register",
};

const payPlan = {
  name: "Pay-per-plan",
  price: "3",
  unit: "per operazione",
  tag: "Popolare",
  features: [
    "Operazioni illimitate",
    "Tutte e 3 le aree di analisi",
    "Calcoli e indicatori completi",
    "Report PDF professionali",
    "Duplicazione operazioni",
    "Archivio completo",
  ],
  cta: "Inizia ora",
  href: "/register",
};

const premiumPlan = {
  name: "Premium",
  price: "10",
  unit: "€/mese",
  features: [
    "Tutto di Pay-per-plan",
    "Operazioni illimitate incluse",
    "Scenari multipli",
    "Confronto tra operazioni",
    "Monitoraggio previsto vs reale",
    "Grafici avanzati di sensibilità",
  ],
  cta: "Prova Premium",
  href: "/register",
};

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 sm:py-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <p className="text-sm font-bold text-[#7B61FF] uppercase tracking-widest mb-4">
            Prezzi
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A24] mb-5 tracking-tight">
            Semplici e <span className="text-gradient-glass">trasparenti</span>
          </h2>
          <p className="text-base sm:text-lg text-[#1A1A24]/50 leading-relaxed px-4">
            Inizia gratis. Paga solo quando hai bisogno di più.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div className="glass-panel p-7 sm:p-8 hover:-translate-y-1">
            <p className="text-sm font-bold text-[#1A1A24]/40 uppercase tracking-wider mb-3">
              {freePlan.name}
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-extrabold text-[#1A1A24] tracking-tight">
                {freePlan.price}
              </span>
              <span className="text-xl text-[#1A1A24]/40 font-semibold">€</span>
            </div>
            <p className="text-sm text-[#1A1A24]/35 mb-8 font-medium">{freePlan.unit}</p>
            <div className="space-y-3.5 mb-8">
              {freePlan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-[#1A1A24]/70 text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
            <Link
              href={freePlan.href}
              className="block w-full text-center py-3 rounded-xl text-[#1A1A24]/70 font-semibold text-sm transition-all border border-[#1A1A24]/10 hover:border-[#7B61FF]/30 hover:text-[#7B61FF]"
            >
              {freePlan.cta}
            </Link>
          </div>

          {/* Pay-per-plan (featured) */}
          <div className="glass-panel relative p-7 sm:p-8 hover:-translate-y-1 !border-[#7B61FF]/30 !shadow-[0_8px_32px_rgba(123,97,255,0.12),0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 btn-glass-primary flex items-center gap-1.5 px-4 py-1.5 !rounded-full text-xs !shadow-md">
              <Sparkles className="w-3 h-3" />
              Popolare
            </div>

            <p className="text-sm font-bold text-[#7B61FF] uppercase tracking-wider mb-3">
              {payPlan.name}
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-extrabold text-[#1A1A24] tracking-tight">
                {payPlan.price}
              </span>
              <span className="text-xl text-[#1A1A24]/40 font-semibold">€</span>
            </div>
            <p className="text-sm text-[#1A1A24]/35 mb-8 font-medium">{payPlan.unit}</p>
            <div className="space-y-3.5 mb-8">
              {payPlan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-[#7B61FF]/10 border border-[#7B61FF]/20">
                    <Check className="w-3 h-3 text-[#7B61FF]" />
                  </div>
                  <span className="text-[#1A1A24]/80 text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
            <Link
              href={payPlan.href}
              className="group btn-glass-primary flex items-center justify-center gap-2 w-full py-3 !rounded-xl text-sm"
            >
              {payPlan.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-center text-xs text-[#1A1A24]/30 mt-3 font-medium">
              Pagamento sicuro con Stripe
            </p>
          </div>

          {/* Premium */}
          <div className="glass-panel relative p-7 sm:p-8 overflow-hidden hover:-translate-y-1 !border-amber-400/30">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                  {premiumPlan.name}
                </p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold text-[#1A1A24] tracking-tight">
                  {premiumPlan.price}
                </span>
                <span className="text-xl text-[#1A1A24]/40 font-semibold">€/mese</span>
              </div>
              <p className="text-sm text-[#1A1A24]/35 mb-8 font-medium">
                cancella quando vuoi
              </p>
              <div className="space-y-3.5 mb-8">
                {premiumPlan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-500/10 border border-amber-500/20">
                      <Check className="w-3 h-3 text-amber-500" />
                    </div>
                    <span className="text-[#1A1A24]/70 text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href={premiumPlan.href}
                className="block w-full text-center py-3 rounded-xl font-bold text-sm text-[#1A1A24] transition-all duration-200 hover:brightness-110 shadow-lg shadow-amber-500/15"
                style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
              >
                {premiumPlan.cta}
              </Link>
              <p className="text-center text-xs text-[#1A1A24]/30 mt-3 font-medium">
                Pagamento sicuro con Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
