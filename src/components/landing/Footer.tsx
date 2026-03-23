import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden py-12 sm:py-16 border-t border-[#1A1A24]/[0.06]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #7B61FF, #00C2FF)" }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-[#1A1A24] tracking-tight">
                Impresius
              </span>
            </Link>
            <p className="text-sm text-[#1A1A24]/40 leading-relaxed max-w-sm">
              La piattaforma professionale per creare business plan immobiliari.
              Analizza, confronta e decidi con i dati.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-[#1A1A24] font-bold mb-4 text-sm">Prodotto</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-[#1A1A24]/40 hover:text-[#7B61FF] transition-colors font-medium"
                >
                  Funzionalità
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-[#1A1A24]/40 hover:text-[#7B61FF] transition-colors font-medium"
                >
                  Prezzi
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-[#1A1A24]/40 hover:text-[#7B61FF] transition-colors font-medium"
                >
                  Come Funziona
                </a>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-[#1A1A24] font-bold mb-4 text-sm">Legale</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-[#1A1A24]/40 hover:text-[#7B61FF] transition-colors font-medium"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[#1A1A24]/40 hover:text-[#7B61FF] transition-colors font-medium"
                >
                  Termini di Servizio
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-[#1A1A24]/40 hover:text-[#7B61FF] transition-colors font-medium"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#1A1A24]/[0.06]">
          <p className="text-sm text-[#1A1A24]/30 font-medium">
            &copy; {new Date().getFullYear()} Impresius. Tutti i diritti riservati.
          </p>
          <p className="text-xs text-[#1A1A24]/20 font-medium">
            Made with passion for real estate investors
          </p>
        </div>
      </div>
    </footer>
  );
}
