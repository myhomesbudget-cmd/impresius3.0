"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Building2, Lock, CheckCircle2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non corrispondono.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Errore nell'aggiornamento della password. Riprova.");
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
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A24] mb-2">
            Password aggiornata
          </h1>
          <p className="text-[#1A1A24]/50 text-sm">
            La tua password è stata aggiornata con successo.
          </p>
          <Link
            href="/dashboard"
            className="btn-glass-primary inline-block mt-6 px-6 py-3 text-sm"
          >
            Vai alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 mesh-gradient-auth">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #7B61FF, #00C2FF)" }}
          >
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-gradient-glass">
            Impresius
          </span>
        </Link>

        {/* Card */}
        <div className="glass-panel-lg p-8">
          <h1 className="text-2xl font-extrabold text-[#1A1A24] text-center mb-2">
            Nuova Password
          </h1>
          <p className="text-[#1A1A24]/50 text-center text-sm mb-8">
            Scegli una nuova password per il tuo account
          </p>

          {error && (
            <div className="bg-[#FF2D55]/10 border border-[#FF2D55]/20 text-[#FF2D55] text-sm rounded-xl p-3.5 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1A1A24]">
                Nuova Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A24]/30 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Minimo 6 caratteri"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1A1A24]">
                Conferma Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A24]/30 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Ripeti la password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Aggiornamento in corso…" : "Aggiorna Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
