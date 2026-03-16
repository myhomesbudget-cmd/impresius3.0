import {
  Calculator,
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Calcoli Automatici",
    description:
      "Inserisci i dati dell'immobile e ottieni istantaneamente ROI, rendimento netto, cash flow e tutte le metriche chiave.",
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Proiezioni Multi-Anno",
    description:
      "Visualizza l'andamento del tuo investimento nel tempo con proiezioni fino a 30 anni, inclusa rivalutazione e inflazione.",
    color: "indigo",
  },
  {
    icon: PieChart,
    title: "Analisi Costi Dettagliata",
    description:
      "Costi di acquisizione, ristrutturazione, spese correnti e finanziamento: tutto calcolato con precisione professionale.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Metriche Professionali",
    description:
      "Cap Rate, Cash-on-Cash Return, Break-even Occupancy e tutte le metriche usate dai professionisti del settore.",
    color: "green",
  },
  {
    icon: FileText,
    title: "Piani Illimitati",
    description:
      "Crea quanti business plan desideri. Confronta scenari diversi e trova l'investimento perfetto per te.",
    color: "orange",
  },
  {
    icon: Lock,
    title: "Dati Sicuri",
    description:
      "I tuoi dati sono crittografati e protetti. Solo tu puoi accedere ai tuoi piani economici e alle tue analisi.",
    color: "red",
  },
];

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
  green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-100" },
  red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
};

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tutto ci&ograve; che serve per{" "}
            <span className="text-gradient">analizzare investimenti</span>
          </h2>
          <p className="text-lg text-gray-600">
            Strumenti professionali pensati per investitori e operatori immobiliari
            che vogliono prendere decisioni basate sui dati.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const colors = colorClasses[feature.color];
            return (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
