import { UserPlus, ClipboardList, BarChart3, Download } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Crea l'Operazione",
    description: "Registrati gratis e crea la tua prima operazione immobiliare. Inserisci localita, tipologia e strategia.",
  },
  {
    icon: ClipboardList,
    step: "02",
    title: "Compila le 3 Aree",
    description: "Costi di acquisizione, computo metrico delle opere e stima del valore di vendita. Tutto guidato e strutturato.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Analizza i Risultati",
    description: "Margini, ROI, incidenza costi, costo al mq: tutti gli indicatori per capire se l'operazione conviene.",
  },
  {
    icon: Download,
    step: "04",
    title: "Genera il Report",
    description: "Esporta un report PDF professionale da condividere con investitori, partner e collaboratori.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight">
            Come funziona
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Da zero a business plan completo in 4 semplici passaggi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => (
            <div key={idx} className="relative text-center group">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-blue-200 to-indigo-200/50" />
              )}

              <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 mb-7 group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgb(59_130_246/0.12)] transition-all duration-300">
                <item.icon className="w-10 h-10 text-blue-600" />
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-[0_2px_8px_rgb(37_99_235/0.4)]">
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[250px] mx-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
