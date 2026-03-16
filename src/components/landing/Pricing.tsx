import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";

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
            Nessun abbonamento. Paghi solo per i piani che crei.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Main pricing card */}
          <div className="relative bg-white rounded-3xl border-2 border-blue-100 shadow-xl overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Pay-per-plan
            </div>

            <div className="p-10">
              {/* Price */}
              <div className="text-center mb-8">
                <p className="text-sm font-medium text-gray-500 mb-2">Per ogni business plan</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-extrabold text-gray-900">3</span>
                  <span className="text-2xl font-bold text-gray-400">,00</span>
                  <span className="text-xl text-gray-500 ml-1">&euro;</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">una tantum &middot; nessun rinnovo</p>
              </div>

              {/* Features list */}
              <div className="space-y-4 mb-10">
                {[
                  "Registrazione gratuita",
                  "Dashboard personale illimitata",
                  "Analisi completa con tutte le metriche",
                  "Proiezioni finanziarie multi-anno",
                  "Calcolo ROI, Cap Rate, Cash Flow",
                  "Analisi affitto e compravendita (flip)",
                  "Dati salvati in cloud sicuro",
                  "Accesso illimitato ai tuoi piani",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link href="/register">
                <Button variant="gradient" size="xl" className="w-full group">
                  Inizia ora
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <p className="text-center text-xs text-gray-400 mt-4">
                Pagamento sicuro con Stripe o PayPal
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
