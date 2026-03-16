import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Crown } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Prezzi{" "}
            <span className="text-gradient">semplici e trasparenti</span>
          </h2>
          <p className="text-lg text-gray-600">
            Inizia gratis. Paga solo quando hai bisogno di piu.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Gratuito</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold text-gray-900">0</span>
                <span className="text-xl text-gray-400">&euro;</span>
              </div>
              <p className="text-sm text-gray-500 mb-8">per sempre</p>

              <div className="space-y-3 mb-8">
                {[
                  "1 operazione completa",
                  "Tutte e 3 le aree di analisi",
                  "Calcoli e indicatori",
                  "Dashboard personale",
                  "Report PDF base",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">{f}</span>
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
          <div className="relative bg-white rounded-2xl border-2 border-blue-200 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Popolare
            </div>

            <div className="p-8">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Pay-per-plan</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold text-gray-900">3</span>
                <span className="text-xl text-gray-400">&euro;</span>
              </div>
              <p className="text-sm text-gray-500 mb-8">per operazione</p>

              <div className="space-y-3 mb-8">
                {[
                  "Operazioni illimitate",
                  "Tutte e 3 le aree di analisi",
                  "Calcoli e indicatori completi",
                  "Report PDF professionali",
                  "Duplicazione operazioni",
                  "Archivio completo",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button variant="gradient" size="lg" className="w-full group">
                  Inizia ora
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-center text-xs text-gray-400 mt-3">
                Pagamento sicuro con Stripe
              </p>
            </div>
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden text-white">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Premium</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold">10</span>
                <span className="text-xl text-gray-400">&euro;/mese</span>
              </div>
              <p className="text-sm text-gray-400 mb-8">cancella quando vuoi</p>

              <div className="space-y-3 mb-8">
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
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-gray-200 text-sm">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold">
                  Prova Premium
                </Button>
              </Link>
              <p className="text-center text-xs text-gray-500 mt-3">
                Prossimamente disponibile
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
