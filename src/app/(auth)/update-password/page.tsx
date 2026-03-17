"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Lock, CheckCircle2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
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
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Password aggiornata
            </h1>
            <p className="text-slate-500 text-sm">
              La tua password è stata aggiornata con successo.
            </p>
            <Link href="/dashboard">
              <Button variant="gradient" className="mt-6">
                Vai alla Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 icon-gradient rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">Impresius</span>
        </Link>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-8">
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
            Nuova Password
          </h1>
          <p className="text-slate-500 text-center text-sm mb-8">
            Scegli una nuova password per il tuo account
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <Input
              label="Nuova Password"
              type="password"
              placeholder="Minimo 6 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Conferma Password"
              type="password"
              placeholder="Ripeti la password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Aggiorna Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
