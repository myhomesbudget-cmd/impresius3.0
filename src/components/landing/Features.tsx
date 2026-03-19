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
    description: "Costruisci il computo delle opere per piano, con voci di lavorazione, misurazioni e calcoli automatici.",
    gradient: "from-blue-600 to-blue-500",
    glow: "rgba(37,99,235,0.3)",
  },
  {
    icon: BarChart3,
    title: "Stima Valori Commerciali",
    description: "Stima il valore di vendita con superfici ragguagliate, coefficienti correttivi e prezzo al mq per ogni unità.",
    gradient: "from-violet-600 to-violet-500",
    glow: "rgba(124,58,237,0.3)",
  },
  {
    icon: PieChart,
    title: "Analisi Costi Completa",
    description: "Acquisizione, professionisti, titoli edilizi, utenze, gestione: ogni voce calcolata con percentuali e formule reali.",
    gradient: "from-indigo-600 to-indigo-500",
    glow: "rgba(79,70,229,0.3)",
  },
  {
    icon: TrendingUp,
    title: "Margini e ROI Istantanei",
    description: "Margine lordo, ROI, incidenza costi, costo al mq: tutti gli indicatori per decidere se un'operazione conviene.",
    gradient: "from-emerald-600 to-emerald-500",
    glow: "rgba(5,150,105,0.3)",
  },
  {
    icon: FileText,
    title: "Report PDF Professionali",
    description: "Genera executive summary pronti per banche e investitori, da scaricare in un click.",
    gradient: "from-amber-600 to-amber-500",
    glow: "rgba(217,119,6,0.3)",
  },
  {
    icon: Lock,
    title: "Sicuro e Privato",
    description: "I tuoi dati sono crittografati con Supabase. Solo tu accedi alle tue operazioni.",
    gradient: "from-rose-600 to-rose-500",
    glow: "rgba(225,29,72,0.3)",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0e1e 0%, #0d1224 100%)" }}
    >
      {/* Section blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(79,70,229,0.08) 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Funzionalità</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 tracking-tight">
            Tutto ciò che serve per{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #60a5fa, #c084fc)" }}
            >
              analizzare investimenti
            </span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Strumenti professionali pensati per investitori e operatori che vogliono decidere basandosi sui dati.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${f.glow}, transparent 70%)` }}
              />

              {/* Icon */}
              <div
                className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                style={{ boxShadow: `0 8px 24px ${f.glow}` }}
              >
                <f.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white mb-2.5">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
