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
    title: "Computo Metrico Integrato",
    description:
      "Costruisci il computo metrico delle opere per piano, con voci di lavorazione, misurazioni e calcoli automatici.",
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Stima Valori Commerciali",
    description:
      "Stima il valore di vendita con superfici ragguagliate, coefficienti correttivi e prezzo al mq per ogni unita immobiliare.",
    color: "indigo",
  },
  {
    icon: PieChart,
    title: "Analisi Costi Completa",
    description:
      "Acquisizione, professionisti, titoli edilizi, utenze, gestione: ogni voce di costo calcolata con percentuali e formule reali.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Margini e ROI Istantanei",
    description:
      "Margine lordo, ROI, incidenza costi, costo al mq: tutti gli indicatori che servono per decidere se un'operazione conviene.",
    color: "green",
  },
  {
    icon: FileText,
    title: "Report PDF Professionali",
    description:
      "Genera report completi e professionali da condividere con investitori, partner e collaboratori.",
    color: "orange",
  },
  {
    icon: Lock,
    title: "Sicuro e Privato",
    description:
      "I tuoi dati sono crittografati e protetti. Solo tu puoi accedere alle tue operazioni e alle tue analisi.",
    color: "red",
  },
];

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200/60" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-200/60" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200/60" },
  green: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200/60" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200/60" },
  red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200/60" },
};

export function Features() {
  return (
    <section id="features" className="py-28 bg-white/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight">
            Tutto ci&ograve; che serve per{" "}
            <span className="text-gradient">analizzare investimenti</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Strumenti professionali pensati per investitori e operatori immobiliari
            che vogliono prendere decisioni basate sui dati.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const colors = colorClasses[feature.color];
            return (
              <div
                key={idx}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-[0_1px_3px_rgb(0_0_0/0.03)] hover:shadow-[0_8px_24px_rgb(0_0_0/0.06)] hover:border-slate-200 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
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
