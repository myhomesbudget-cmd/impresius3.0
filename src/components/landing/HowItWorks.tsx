import { UserPlus, ClipboardList, BarChart3, Download } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Crea l'Operazione",
    description: "Registrati gratis e crea la tua prima operazione. Inserisci località, tipologia e strategia.",
    color: "from-blue-600 to-blue-500",
  },
  {
    icon: ClipboardList,
    step: "02",
    title: "Compila le 3 Aree",
    description: "Costi di acquisizione, computo metrico e stima del valore commerciale. Tutto guidato e strutturato.",
    color: "from-indigo-600 to-indigo-500",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Analizza i Risultati",
    description: "Margini, ROI, incidenza costi: tutti gli indicatori per capire se l'operazione conviene.",
    color: "from-violet-600 to-violet-500",
  },
  {
    icon: Download,
    step: "04",
    title: "Genera il Report",
    description: "Esporta un executive summary PDF da condividere con investitori, partner e banche.",
    color: "from-purple-600 to-purple-500",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0d1224 0%, #0a0e1e 100%)" }}
    >
      {/* Blob */}
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-sm font-bold text-violet-400 uppercase tracking-widest mb-4">Come Funziona</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 tracking-tight">
            Da zero a business plan in{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #818cf8, #c084fc)" }}
            >
              4 passaggi
            </span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Nessun foglio Excel, nessun calcolo manuale. Solo risposte chiare.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => (
            <div key={idx} className="relative group text-center">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-12 left-[65%] w-[70%] h-px"
                  style={{ background: "linear-gradient(90deg, rgba(79,70,229,0.4), transparent)" }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-7 group-hover:scale-105 transition-transform duration-300"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <item.icon className="w-10 h-10 text-slate-300" />
                <span
                  className={`absolute -top-2.5 -right-2.5 w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${item.color} shadow-lg`}
                >
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2.5">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 hover:scale-[1.02] shadow-2xl shadow-indigo-500/30"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
          >
            Inizia subito, è gratis →
          </Link>
        </div>
      </div>
    </section>
  );
}
