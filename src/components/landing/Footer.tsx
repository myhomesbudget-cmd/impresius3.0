import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgb(59_130_246/0.3)]">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">Impresius</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              La piattaforma professionale per creare business plan immobiliari.
              Analizza, confronta e decidi con i dati.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Prodotto</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors font-medium">Funzionalit&agrave;</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors font-medium">Prezzi</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors font-medium">Come Funziona</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legale</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors font-medium">Termini di Servizio</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors font-medium">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium">
            &copy; {new Date().getFullYear()} Impresius. Tutti i diritti riservati.
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Made with passion for real estate investors
          </p>
        </div>
      </div>
    </footer>
  );
}
