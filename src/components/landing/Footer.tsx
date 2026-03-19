import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden py-16"
      style={{ background: "#05080f", borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Subtle glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.05) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xl"
                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Impresius</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              La piattaforma professionale per creare business plan immobiliari.
              Analizza, confronta e decidi con i dati.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Prodotto</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="text-slate-500 hover:text-white transition-colors font-medium">Funzionalità</a></li>
              <li><a href="#pricing" className="text-slate-500 hover:text-white transition-colors font-medium">Prezzi</a></li>
              <li><a href="#how-it-works" className="text-slate-500 hover:text-white transition-colors font-medium">Come Funziona</a></li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Legale</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="text-slate-500 hover:text-white transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-500 hover:text-white transition-colors font-medium">Termini di Servizio</Link></li>
              <li><Link href="/cookies" className="text-slate-500 hover:text-white transition-colors font-medium">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-sm text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} Impresius. Tutti i diritti riservati.
          </p>
          <p className="text-xs text-slate-700 font-medium">
            Made with passion for real estate investors 🚀
          </p>
        </div>
      </div>
    </footer>
  );
}
