"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Building2, Mail, Lock, CheckCircle2, TrendingUp, BarChart3, FileText } from "lucide-react";

const features = [
  { icon: TrendingUp, text: "Calcola ROI e Margine in tempo reale" },
  { icon: BarChart3,  text: "Computo metrico estimativo professionale" },
  { icon: FileText,  text: "Genera Executive Summary per le banche" },
];

function Blob({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse pointer-events-none ${className}`}
    />
  );
}

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
    <div className="min-h-screen relative flex overflow-hidden bg-background">
      {/* ── LEFT PANEL (hidden on mobile) ────────────────────────── */}
      <div className="hidden lg:flex w-[54%] xl:w-[58%] relative flex-col justify-between p-12 overflow-hidden"
           style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f2027 100%)" }}>
        {/* Animated blobs */}
        <Blob className="w-96 h-96 bg-blue-600 -top-20 -left-20" />
        <Blob className="w-72 h-72 bg-violet-600 top-1/2 -right-12" />
        <Blob className="w-80 h-80 bg-indigo-500 bottom-0 left-1/4" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40"
               style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white tracking-tight">Impresius</span>
            <span className="block text-[0.6rem] text-blue-300/70 font-semibold uppercase tracking-[0.2em]">Pro Platform</span>
          </div>
        </Link>

        {/* Pitch */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <p className="text-blue-300/80 text-sm font-bold uppercase tracking-widest mb-6">
            Il software immobiliare che ti fa stare davanti
          </p>
          <h2 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-8">
            Ogni operazione,<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #60a5fa, #c084fc)" }}>
              analizzata al centesimo.
            </span>
          </h2>
          <p className="text-slate-300/70 text-lg leading-relaxed max-w-sm mb-12">
            Smetti di lavorare su fogli di calcolo. Imposta Acquisizione, Computo Metrico e Stima Vendita — il margine si calcola da solo.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-slate-300/80 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-l-2 border-blue-500/40 pl-5">
          <p className="text-slate-400/70 text-sm italic leading-relaxed">
            &ldquo;Ho ridotto i tempi di analisi di un&rsquo;operazione da 3 ore a 20 minuti.&rdquo;
          </p>
          <p className="text-slate-500/60 text-xs mt-2 font-semibold">Marco R. — Investitore immobiliare, Milano</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-gradient">Impresius</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-9">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
              Bentornato 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              Accedi per tornare alle tue operazioni
            </p>
          </div>

          {isConfirmed && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl p-3.5 mb-6 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Account confermato! Ora puoi accedere.
            </div>
          )}

          {(hasAuthError || error) && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl p-3.5 mb-6">
              {error || "Errore di autenticazione. Riprova."}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <Link href="/reset-password" className="text-xs text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                  Dimenticata?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="La tua password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: loading ? "#6b7280" : "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Accesso in corso…
                </span>
              ) : "Accedi →"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Non hai un account?{" "}
            <Link href="/register" className="text-blue-500 font-bold hover:text-blue-600 transition-colors">
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
