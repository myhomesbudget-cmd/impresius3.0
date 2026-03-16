import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Impresius</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              La piattaforma professionale per creare business plan immobiliari.
              Analizza, confronta e decidi con i dati.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Prodotto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Funzionalit&agrave;</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Prezzi</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Come Funziona</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legale</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Termini di Servizio</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Impresius. Tutti i diritti riservati.
          </p>
          <p className="text-xs text-gray-500">
            Made with passion for real estate investors
          </p>
        </div>
      </div>
    </footer>
  );
}
