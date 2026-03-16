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
  pay_per_plan: 'Pay per Plan',
  premium: 'Premium',
};

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  pay_per_plan: 'bg-blue-100 text-blue-700',
  premium: 'bg-amber-100 text-amber-700',
};

export default function SettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  const [userEmail, setUserEmail] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);

  // Form state
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

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
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
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestisci il tuo profilo e il tuo abbonamento
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1 - Profilo Personale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Profilo Personale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Mario Rossi"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Azienda
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nome azienda"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Telefono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+39 333 1234567"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={userEmail}
                  readOnly
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saved ? 'Salvato!' : 'Salva Modifiche'}
              </Button>
              {saved && (
                <span className="text-sm text-emerald-600 font-medium">
                  Profilo aggiornato con successo
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2 - Piano e Abbonamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Piano e Abbonamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Piano attuale
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Piano gratuito utilizzato
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    profile.free_plan_used
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {profile.free_plan_used ? 'Utilizzato' : 'Disponibile'}
                </span>
              </div>
            )}

            {profile?.subscription_plan === 'premium' &&
              profile.subscription_expires_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Scadenza abbonamento
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(profile.subscription_expires_at)}
                  </span>
                </div>
              )}

            <div className="pt-2">
              {profile?.subscription_plan === 'premium' ? (
                <Button disabled variant="outline">
                  <Crown className="w-4 h-4 mr-2" />
                  Piano Premium attivo
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3 - Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleResetPassword}>
                  Cambia Password
                </Button>
                {passwordSent && (
                  <span className="text-sm text-emerald-600 font-medium">
                    Email inviata! Controlla la tua casella di posta.
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Riceverai un&apos;email con il link per reimpostare la password.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <Button variant="outline" disabled className="text-red-500">
                Elimina Account
              </Button>
              <p className="mt-1.5 text-xs text-gray-500">
                Per eliminare il tuo account, contattaci all&apos;indirizzo{' '}
                <a
                  href="mailto:supporto@impresius.com"
                  className="text-blue-600 hover:underline"
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
