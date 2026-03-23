"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Building2, Mail, Lock, CheckCircle2, TrendingUp, BarChart3, FileText } from "lucide-react";

const features = [
  { icon: TrendingUp, text: "Calcola ROI e Margine in tempo reale" },
  { icon: BarChart3, text: "Computo metrico estimativo professionale" },
  { icon: FileText, text: "Genera Executive Summary per le banche" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isConfirmed = searchParams.get("confirmed") === "true";
  const hasAuthError = searchParams.get("error") === "auth";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email o password non corretti. Riprova.");
      setLoading(false);
      return;
    }
    const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";
    router.push(redirectedFrom);
    router.refresh();
  };

  return (
    <div className="min-h-screen relative flex overflow-hidden mesh-gradient-auth">
      {/* ── LEFT PANEL (hidden on mobile) ────────────────────────── */}
      <div className="hidden lg:flex w-[54%] xl:w-[58%] relative flex-col justify-between p-12 overflow-hidden glass-sidebar">
        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 z-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #7B61FF, #00C2FF)" }}
          >
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-[#1A1A24] tracking-tight">
              Impresius
            </span>
            <span className="block text-[0.6rem] text-[#7B61FF] font-semibold uppercase tracking-[0.2em]">
              Pro Platform
            </span>
          </div>
        </Link>

        {/* Pitch */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <p className="text-[#7B61FF] text-sm font-bold uppercase tracking-widest mb-6">
            Il software immobiliare che ti fa stare davanti
          </p>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-[#1A1A24] leading-tight mb-8">
            Ogni operazione,
            <br />
            <span className="text-gradient-glass">analizzata al centesimo.</span>
          </h2>
          <p className="text-[#1A1A24]/50 text-lg leading-relaxed max-w-sm mb-12">
            Smetti di lavorare su fogli di calcolo. Imposta Acquisizione, Computo
            Metrico e Stima Vendita — il margine si calcola da solo.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#7B61FF]/10 border border-[#7B61FF]/15">
                  <Icon className="w-4 h-4 text-[#7B61FF]" />
                </div>
                <span className="text-[#1A1A24]/60 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-l-2 border-[#7B61FF]/30 pl-5">
          <p className="text-[#1A1A24]/40 text-sm italic leading-relaxed">
            &ldquo;Ho ridotto i tempi di analisi di un&rsquo;operazione da 3 ore a
            20 minuti.&rdquo;
          </p>
          <p className="text-[#1A1A24]/30 text-xs mt-2 font-semibold">
            Marco R. — Investitore immobiliare, Milano
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        {/* Mobile logo */}
        <Link
          href="/"
          className="lg:hidden absolute top-6 left-6 flex items-center gap-2"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7B61FF, #00C2FF)" }}
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-gradient-glass">Impresius</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-9">
            <h1 className="text-3xl font-extrabold text-[#1A1A24] tracking-tight mb-2">
              Bentornato
            </h1>
            <p className="text-[#1A1A24]/40 text-sm">
              Accedi per tornare alle tue operazioni
            </p>
          </div>

          {isConfirmed && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm rounded-xl p-3.5 mb-6 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Account confermato! Ora puoi accedere.
            </div>
          )}

          {(hasAuthError || error) && (
            <div className="bg-[#FF2D55]/10 border border-[#FF2D55]/20 text-[#FF2D55] text-sm rounded-xl p-3.5 mb-6">
              {error || "Errore di autenticazione. Riprova."}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1A1A24]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A24]/30 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#1A1A24]">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-[#7B61FF] hover:text-[#6B51EF] font-semibold transition-colors"
                >
                  Dimenticata?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A24]/30 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="La tua password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-glass-primary text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Accesso in corso…
                </span>
              ) : (
                "Accedi"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#1A1A24]/40 mt-8">
            Non hai un account?{" "}
            <Link
              href="/register"
              className="text-[#7B61FF] font-bold hover:text-[#6B51EF] transition-colors"
            >
              Registrati gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
