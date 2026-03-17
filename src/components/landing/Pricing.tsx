import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Crown } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="py-28 bg-white/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight">
            Prezzi{" "}
            <span className="text-gradient">semplici e trasparenti</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Inizia gratis. Paga solo quando hai bisogno di piu.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgb(0_0_0/0.03)] hover:shadow-[0_8px_24px_rgb(0_0_0/0.06)] transition-all duration-300 overflow-hidden">
            <div className="p-8">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Gratuito</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">0</span>
                <span className="text-xl text-slate-400 font-semibold">&euro;</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 font-medium">per sempre</p>

              <div className="space-y-3.5 mb-8">
                {[
                  "1 operazione completa",
                  "Tutte e 3 le aree di analisi",
                  "Calcoli e indicatori",
                  "Dashboard personale",
                  "Report PDF base",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button variant="outline" size="lg" className="w-full">
                  Registrati gratis
                </Button>
              </Link>
            </div>
          </div>

          {/* Pay-per-plan */}
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-blue-200 shadow-[0_4px_24px_rgb(59_130_246/0.12)] overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-[0_2px_8px_rgb(37_99_235/0.3)]">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Popolare
            </div>

            <div className="p-8">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Pay-per-plan</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">3</span>
                <span className="text-xl text-slate-400 font-semibold">&euro;</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 font-medium">per operazione</p>

              <div className="space-y-3.5 mb-8">
                {[
                  "Operazioni illimitate",
                  "Tutte e 3 le aree di analisi",
                  "Calcoli e indicatori completi",
                  "Report PDF professionali",
                  "Duplicazione operazioni",
                  "Archivio completo",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button variant="gradient" size="lg" className="w-full group gap-2">
                  Inizia ora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                Pagamento sicuro con Stripe
              </p>
            </div>
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl overflow-hidden text-white shadow-[0_4px_24px_rgb(0_0_0/0.15)]">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-bold text-amber-400 uppercase tracking-wider">Premium</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold tracking-tight">10</span>
                <span className="text-xl text-slate-400 font-semibold">&euro;/mese</span>
              </div>
              <p className="text-sm text-slate-400 mb-8 font-medium">cancella quando vuoi</p>

              <div className="space-y-3.5 mb-8">
                {[
                  "Tutto di Pay-per-plan",
                  "Operazioni illimitate incluse",
                  "Scenari multipli",
                  "Confronto tra operazioni",
                  "Monitoraggio previsto vs reale",
                  "Dashboard gestionale avanzata",
                  "Grafici e analisi di sensibilita",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-slate-200 text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-[0_2px_8px_rgb(245_158_11/0.4)]">
                  Prova Premium
                </Button>
              </Link>
              <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                Pagamento sicuro con Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
