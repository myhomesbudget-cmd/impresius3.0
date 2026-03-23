"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Building2, Mail, ArrowLeft, ShieldCheck } from "lucide-react";

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
      } else if (
        error.message?.includes("not found") ||
        error.message?.includes("not registered")
      ) {
        setSent(true);
        setLoading(false);
        return;
      } else {
        setError(
          `Errore: ${error.message || "Impossibile inviare l'email. Riprova."}`
        );
      }
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden mesh-gradient-auth">
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #7B61FF, #00C2FF)" }}
          >
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-[#1A1A24] tracking-tight">
            Impresius
          </span>
        </Link>

        {/* Card */}
        <div className="glass-panel-lg p-8">
          {sent ? (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                style={{ background: "linear-gradient(135deg, #7B61FF, #00C2FF)" }}
              >
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1A1A24] mb-3">
                Email inviata!
              </h1>
              <p className="text-[#1A1A24]/50 text-sm leading-relaxed">
                Se esiste un account con{" "}
                <strong className="text-[#1A1A24]">{email}</strong>, riceverai un
                link per reimpostare la password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-[#7B61FF] hover:text-[#6B51EF] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Torna al Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-[#1A1A24] mb-2">
                  Password dimenticata?
                </h1>
                <p className="text-[#1A1A24]/50 text-sm leading-relaxed">
                  Inserisci la tua email e ti invieremo un link per reimpostarla.
                </p>
              </div>

              {error && (
                <div className="bg-[#FF2D55]/10 border border-[#FF2D55]/20 text-[#FF2D55] text-sm rounded-xl p-3.5 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#1A1A24]">
                    Email
                  </label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl btn-glass-primary text-sm transition-all duration-200 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? "Invio in corso…" : "Invia link di reset"}
                </button>
              </form>
            </>
          )}
        </div>

        {!sent && (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-[#1A1A24]/35 mt-6 hover:text-[#7B61FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna al Login
          </Link>
        )}
      </div>
    </div>
  );
}
