'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Profile } from '@/types/database';
import {
  User,
  Building,
  Phone,
  Mail,
  Crown,
  Shield,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import Link from 'next/link';

const planLabels: Record<string, string> = {
  free: 'Gratuito',
  premium: 'Premium',
};

const planColors: Record<string, string> = {
  free: 'bg-muted text-foreground border border-border',
  premium: 'bg-amber-500/10 dark:bg-amber-500/200/10 dark:bg-amber-500/10 dark:bg-amber-500/200/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
};

export default function SettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  const [userEmail, setUserEmail] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserEmail(user.email || '');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        const p = data as Profile;
        setProfile(p);
        setFullName(p.full_name || '');
        setCompanyName(p.company_name || '');
        setPhone(p.phone || '');
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function handleSaveProfile() {
    if (!profile) return;

    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        company_name: companyName.trim() || null,
        phone: phone.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    setSaving(false);

    if (!error) {
      setSaved(true);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: fullName.trim() || null,
              company_name: companyName.trim() || null,
              phone: phone.trim() || null,
            }
          : prev
      );
      setTimeout(() => setSaved(false), 3000);
    }
  }

  async function handleResetPassword() {
    if (!userEmail) return;

    setPasswordSent(false);

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (!error) {
      setPasswordSent(true);
      setTimeout(() => setPasswordSent(false), 5000);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'subscription' }),
      });
      const data = await res.json();
      
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data.error || 'Errore durante la creazione della sessione.');
      }
    } catch (err) {
      console.error('Errore Upgrade:', err);
      alert('Non è stato possibile avviare il pagamento. Riprova più tardi.');
    } finally {
      setUpgrading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="page-header-title">Impostazioni</h1>
        <p className="page-header-subtitle">
          Gestisci il tuo profilo e il tuo abbonamento
        </p>
      </div>

      <div className="space-y-8">
        {/* Card 1 - Profilo Personale */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle>Profilo Personale</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Mario Rossi"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Azienda
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nome azienda"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Telefono
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+39 333 1234567"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={userEmail}
                  readOnly
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? 'Salvato!' : 'Salva Modifiche'}
              </Button>
              {saved && (
                <span className="text-sm text-emerald-600 font-semibold">
                  Profilo aggiornato con successo
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2 - Piano e Abbonamento */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle>Piano e Abbonamento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted border border-border">
              <span className="text-sm font-semibold text-foreground">
                Piano attuale
              </span>
              <span
                className={`badge-premium ${
                  planColors[profile?.subscription_plan || 'free']
                }`}
              >
                {profile?.subscription_plan === 'premium' && (
                  <Crown className="w-3.5 h-3.5" />
                )}
                {planLabels[profile?.subscription_plan || 'free']}
              </span>
            </div>

            {profile?.subscription_plan === 'free' && (
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted border border-border">
                <span className="text-sm font-semibold text-foreground">
                  Piano gratuito utilizzato
                </span>
                <span
                  className={`badge-premium ${
                    profile.free_plan_used
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {profile.free_plan_used ? 'Utilizzato' : 'Disponibile'}
                </span>
              </div>
            )}

            {profile?.subscription_plan === 'premium' &&
              profile.subscription_expires_at && (
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted border border-border">
                  <span className="text-sm font-semibold text-foreground">
                    Scadenza abbonamento
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatDate(profile.subscription_expires_at)}
                  </span>
                </div>
              )}

            <div className="pt-2">
              {profile?.subscription_plan === 'premium' ? (
                <Button disabled variant="outline" className="gap-2">
                  <Crown className="w-4 h-4" />
                  Piano Premium attivo
                </Button>
              ) : (
                <Button variant="gradient" className="gap-2" onClick={handleUpgrade} disabled={upgrading}>
                  {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                  {upgrading ? 'Avvio in corso...' : 'Upgrade a Premium'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3 - Account */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-muted">
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle>Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleResetPassword}>
                  Cambia Password
                </Button>
                {passwordSent && (
                  <span className="text-sm text-emerald-600 font-semibold">
                    Email inviata! Controlla la tua casella di posta.
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Riceverai un&apos;email con il link per reimpostare la password.
              </p>
            </div>

            <div className="border-t border-border pt-5">
              <Button variant="outline" disabled className="text-red-500 gap-2">
                Elimina Account
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Per eliminare il tuo account, contattaci all&apos;indirizzo{' '}
                <a
                  href="mailto:supporto@impresius.com"
                  className="text-blue-600 font-medium hover:underline"
                >
                  supporto@impresius.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
