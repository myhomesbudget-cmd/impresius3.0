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
      "Costruisci il computo delle opere per piano, con voci di lavorazione, misurazioni e calcoli automatici.",
    color: "#7B61FF",
  },
  {
    icon: BarChart3,
    title: "Stima Valori Commerciali",
    description:
      "Stima il valore di vendita con superfici ragguagliate, coefficienti correttivi e prezzo al mq per ogni unità.",
    color: "#00C2FF",
  },
  {
    icon: PieChart,
    title: "Analisi Costi Completa",
    description:
      "Acquisizione, professionisti, titoli edilizi, utenze, gestione: ogni voce calcolata con percentuali e formule reali.",
    color: "#FF2D55",
  },
  {
    icon: TrendingUp,
    title: "Margini e ROI Istantanei",
    description:
      "Margine lordo, ROI, incidenza costi, costo al mq: tutti gli indicatori per decidere se un'operazione conviene.",
    color: "#7B61FF",
  },
  {
    icon: FileText,
    title: "Report PDF Professionali",
    description:
      "Genera executive summary pronti per banche e investitori, da scaricare in un click.",
    color: "#00C2FF",
  },
  {
    icon: Lock,
    title: "Sicuro e Privato",
    description:
      "I tuoi dati sono crittografati con Supabase. Solo tu accedi alle tue operazioni.",
    color: "#FF2D55",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <p className="text-sm font-bold text-[#7B61FF] uppercase tracking-widest mb-4">
            Funzionalità
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A24] mb-5 tracking-tight">
            Tutto ciò che serve per{" "}
            <span className="text-gradient-glass">analizzare investimenti</span>
          </h2>
          <p className="text-base sm:text-lg text-[#1A1A24]/50 leading-relaxed px-4">
            Strumenti professionali pensati per investitori e operatori che vogliono
            decidere basandosi sui dati.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-panel group p-6 sm:p-8 hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}25`,
                }}
              >
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>

              <h3 className="text-lg font-bold text-[#1A1A24] mb-2.5">{f.title}</h3>
              <p className="text-[#1A1A24]/50 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
