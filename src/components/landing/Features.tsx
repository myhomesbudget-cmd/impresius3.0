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
  blue: { bg: "bg-blue-500/10 dark:bg-blue-500/20", icon: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  indigo: { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20" },
  purple: { bg: "bg-purple-500/10 dark:bg-purple-500/20", icon: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  green: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  orange: { bg: "bg-orange-500/10 dark:bg-orange-500/20", icon: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20" },
  red: { bg: "bg-red-500/10 dark:bg-red-500/20", icon: "text-red-600 dark:text-red-400", border: "border-red-500/20" },
};

export function Features() {
  return (
    <section id="features" className="py-28 bg-card/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-5 tracking-tight">
            Tutto ci&ograve; che serve per{" "}
            <span className="text-gradient">analizzare investimenti</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
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
                className="group bg-card/90 backdrop-blur-sm rounded-2xl p-8 border border-border/60 shadow-[0_1px_3px_hsl(var(--foreground)/0.03)] hover:shadow-[0_8px_24px_hsl(var(--foreground)/0.06)] hover:border-border transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
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
