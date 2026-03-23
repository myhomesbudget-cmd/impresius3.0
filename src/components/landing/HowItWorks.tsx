import { UserPlus, ClipboardList, BarChart3, Download } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Crea l'Operazione",
    description:
      "Registrati gratis e crea la tua prima operazione. Inserisci località, tipologia e strategia.",
    color: "#7B61FF",
  },
  {
    icon: ClipboardList,
    step: "02",
    title: "Compila le 3 Aree",
    description:
      "Costi di acquisizione, computo metrico e stima del valore commerciale. Tutto guidato e strutturato.",
    color: "#00C2FF",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Analizza i Risultati",
    description:
      "Margini, ROI, incidenza costi: tutti gli indicatori per capire se l'operazione conviene.",
    color: "#FF2D55",
  },
  {
    icon: Download,
    step: "04",
    title: "Genera il Report",
    description:
      "Esporta un executive summary PDF da condividere con investitori, partner e banche.",
    color: "#7B61FF",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <p className="text-sm font-bold text-[#00C2FF] uppercase tracking-widest mb-4">
            Come Funziona
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A24] mb-5 tracking-tight">
            Da zero a business plan in{" "}
            <span className="text-gradient-glass">4 passaggi</span>
          </h2>
          <p className="text-base sm:text-lg text-[#1A1A24]/50 leading-relaxed px-4">
            Nessun foglio Excel, nessun calcolo manuale. Solo risposte chiare.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((item, idx) => (
            <div key={idx} className="relative group text-center">
              {/* Connector line (desktop) */}
              {idx < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-12 left-[65%] w-[70%] h-px"
                  style={{
                    background: `linear-gradient(90deg, ${item.color}40, transparent)`,
                  }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-7 group-hover:scale-105 transition-transform duration-300 glass-panel-static !shadow-none">
                <item.icon
                  className="w-10 h-10"
                  style={{ color: `${item.color}80` }}
                />
                <span
                  className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  style={{ background: item.color }}
                >
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1A1A24] mb-2.5">
                {item.title}
              </h3>
              <p className="text-sm text-[#1A1A24]/50 leading-relaxed max-w-[220px] mx-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 sm:mt-20">
          <Link
            href="/register"
            className="btn-glass-primary inline-flex items-center gap-2 px-8 py-4 text-base hover:scale-[1.02] transition-transform"
          >
            Inizia subito, è gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
