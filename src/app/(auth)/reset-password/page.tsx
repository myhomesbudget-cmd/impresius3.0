"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Building2, Mail, ArrowLeft, ShieldCheck } from "lucide-react";

function Blob({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse pointer-events-none ${className}`}
    />
  );
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
    });

    if (error) {
      if (error.message?.includes("rate") || error.status === 429) {
        setError("Troppi tentativi. Attendi qualche minuto e riprova.");
      } else if (error.message?.includes("not found") || error.message?.includes("not registered")) {
        setSent(true);
        setLoading(false);
        return;
      } else {
        setError(`Errore: ${error.message || "Impossibile inviare l'email. Riprova."}`);
      }
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f2027 100%)" }}
    >
      {/* Background blobs */}
      <Blob className="w-96 h-96 bg-blue-600 -top-32 -left-32" />
      <Blob className="w-72 h-72 bg-violet-600 -bottom-20 -right-20" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
          >
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">Impresius</span>
        </Link>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(20px)" }}
        >
          {sent ? (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
              >
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-3">Email inviata!</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Se esiste un account con{" "}
                <strong className="text-white">{email}</strong>, riceverai un link per reimpostare la password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Torna al Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-white mb-2">Password dimenticata?</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Inserisci la tua email e ti invieremo un link per reimpostarla.
                </p>
              </div>

              {error && (
                <div className="bg-red-950/30 border border-red-800 text-red-400 text-sm rounded-xl p-3.5 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-60 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: loading ? "#6b7280" : "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                >
                  {loading ? "Invio in corso…" : "Invia link di reset →"}
                </button>
              </form>
            </>
          )}
        </div>

        {!sent && (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-6 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna al Login
          </Link>
        )}
      </div>
    </div>
  );
}
