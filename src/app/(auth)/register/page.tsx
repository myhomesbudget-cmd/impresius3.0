"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Building2, Mail, Lock, User, BarChart3, TrendingUp, FileText } from "lucide-react";

const features = [
  { icon: BarChart3, text: "Sintesi completa con ROI e Margine" },
  { icon: TrendingUp, text: "Computo Metrico per piano e tipologia" },
  { icon: FileText, text: "Executive Summary per banche e soci" },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/login?confirmed=true`,
      },
    });

    if (error) {
      setError("Errore durante la registrazione. Riprova.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 mesh-gradient-auth">
        <div className="w-full max-w-md text-center glass-panel-lg p-10 sm:p-12">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: "linear-gradient(135deg, #7B61FF, #00C2FF)" }}
          >
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A24] mb-3">
            Controlla la tua email
          </h1>
          <p className="text-[#1A1A24]/50 text-sm leading-relaxed mb-8">
            Ti abbiamo inviato un link di conferma a{" "}
            <strong className="text-[#1A1A24]">{email}</strong>. Clicca sul link
            per attivare il tuo account.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-xl text-[#1A1A24]/70 font-semibold text-sm transition-all border border-[#1A1A24]/10 hover:border-[#7B61FF]/30 hover:text-[#7B61FF]"
          >
            Torna al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex overflow-hidden mesh-gradient-auth">
      {/* ── LEFT PANEL ────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[54%] xl:w-[58%] relative flex-col justify-between p-12 overflow-hidden glass-sidebar">
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

        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <p className="text-[#7B61FF] text-sm font-bold uppercase tracking-widest mb-6">
            Gratis. Subito. Senza carta di credito.
          </p>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-[#1A1A24] leading-tight mb-8">
            Crea il tuo account
            <br />
            <span className="text-gradient-glass">in 30 secondi.</span>
          </h2>
          <p className="text-[#1A1A24]/50 text-lg leading-relaxed max-w-sm mb-12">
            Un&apos;operazione gratis, subito. Poi decidi tu se continuare.
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

        <div className="relative z-10 border-l-2 border-[#7B61FF]/30 pl-5">
          <p className="text-[#1A1A24]/40 text-sm italic leading-relaxed">
            &ldquo;La prima operazione che ho inserito mi ha fatto capire subito
            che non era profittevole. Mi ha salvato mesi di lavoro.&rdquo;
          </p>
          <p className="text-[#1A1A24]/30 text-xs mt-2 font-semibold">
            Luca M. — Developer immobiliare, Torino
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
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
              Crea il tuo account
            </h1>
            <p className="text-[#1A1A24]/40 text-sm">
              Gratis per sempre. Nessuna carta richiesta.
            </p>
          </div>

          {error && (
            <div className="bg-[#FF2D55]/10 border border-[#FF2D55]/20 text-[#FF2D55] text-sm rounded-xl p-3.5 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1A1A24]">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A24]/30 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Mario Rossi"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1A1A24]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A24]/30 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 6 caratteri"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>

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
                  Registrazione in corso…
                </span>
              ) : (
                "Crea Account Gratis"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#1A1A24]/40 mt-8">
            Hai già un account?{" "}
            <Link
              href="/login"
              className="text-[#7B61FF] font-bold hover:text-[#6B51EF] transition-colors"
            >
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
