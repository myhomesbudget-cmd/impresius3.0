import { UserPlus, ClipboardList, BarChart3, Download } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Registrati Gratis",
    description: "Crea il tuo account in pochi secondi. Nessun costo di iscrizione, nessun abbonamento.",
  },
  {
    icon: ClipboardList,
    step: "02",
    title: "Inserisci i Dati",
    description: "Compila i campi con i dati dell'immobile: prezzo, costi, affitto previsto e parametri di finanziamento.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Analizza i Risultati",
    description: "Ottieni istantaneamente rendimenti, cash flow, ROI e proiezioni multi-anno del tuo investimento.",
  },
  {
    icon: Download,
    step: "04",
    title: "Decidi con i Dati",
    description: "Confronta scenari, condividi i report e prendi decisioni informate per i tuoi investimenti.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Come funziona
          </h2>
          <p className="text-lg text-gray-600">
            Da zero a business plan completo in 4 semplici passaggi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => (
            <div key={idx} className="relative text-center group">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200" />
              )}

              <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 mb-6 group-hover:scale-105 transition-transform">
                <item.icon className="w-10 h-10 text-blue-600" />
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
