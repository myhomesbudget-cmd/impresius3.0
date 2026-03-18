"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Mail, ArrowLeft } from "lucide-react";

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
      console.error("Reset password error:", error.message, error.status, error);
      if (error.message?.includes("rate") || error.status === 429) {
        setError("Troppi tentativi. Attendi qualche minuto e riprova.");
      } else if (error.message?.includes("not found") || error.message?.includes("not registered")) {
        // Non rivelare se l'email esiste — mostra successo comunque
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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 icon-gradient rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">Impresius</span>
        </Link>

        <div className="bg-card/90 backdrop-blur-md rounded-2xl shadow-xl border border-border p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Email inviata</h1>
              <p className="text-muted-foreground text-sm">
                Se esiste un account con <strong>{email}</strong>, riceverai un link per reimpostare la password.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground text-center mb-2">
                Password dimenticata?
              </h1>
              <p className="text-muted-foreground text-center text-sm mb-8">
                Inserisci la tua email e ti invieremo un link per reimpostarla
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="nome@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  loading={loading}
                >
                  Invia link di reset
                </Button>
              </form>
            </>
          )}
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al Login
        </Link>
      </div>
    </div>
  );
}
