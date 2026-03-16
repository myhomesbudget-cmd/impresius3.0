'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Payment, Profile } from '@/types/database';
import {
  CreditCard,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Receipt,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  completed: { label: 'Completato', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  pending: { label: 'In attesa', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  failed: { label: 'Fallito', icon: XCircle, color: 'text-red-600 bg-red-50' },
  refunded: { label: 'Rimborsato', icon: RefreshCw, color: 'text-blue-600 bg-blue-50' },
};

const TYPE_LABELS: Record<string, string> = {
  single_plan: 'Singola Operazione',
  subscription: 'Abbonamento Premium',
};

const PROVIDER_LABELS: Record<string, string> = {
  stripe: 'Carta di credito',
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito',
  premium: 'Premium',
};

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: paymentsData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (profileData) setProfile(profileData as Profile);
      setPayments((paymentsData || []) as Payment[]);
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscription' }),
      });
      const data = await res.json();
      if (res.ok && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const completedPayments = payments.filter((p) => p.status === 'completed');
  const totalSpent = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-8 max-w-5xl space-y-8">
      {/* Success / Cancel Banners */}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Pagamento completato con successo!</p>
            <p className="text-sm text-emerald-700 mt-1">
              Il tuo acquisto e stato registrato.{' '}
              <button
                onClick={() => router.push('/plans/new')}
                className="underline font-medium hover:text-emerald-900"
              >
                Crea una nuova operazione
              </button>
            </p>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Pagamento annullato</p>
            <p className="text-sm text-amber-700 mt-1">
              Il pagamento non e stato completato. Puoi riprovare in qualsiasi momento.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagamenti</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestisci il tuo abbonamento e visualizza lo storico dei pagamenti
        </p>
      </div>

      {/* Plan & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan */}
        <Card className="border-2 border-indigo-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Crown className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Piano Attuale</p>
                <p className="text-lg font-bold text-gray-900">
                  {profile ? PLAN_LABELS[profile.subscription_plan] || profile.subscription_plan : '—'}
                </p>
              </div>
            </div>
            {profile?.subscription_plan === 'premium' && profile?.subscription_expires_at && (
              <p className="text-xs text-gray-500">
                Scade il {formatDate(profile.subscription_expires_at)}
              </p>
            )}
            {profile?.subscription_plan === 'free' && (
              <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1', 'bg-gray-100 text-gray-700 border-gray-200')}>
                {profile.free_plan_used ? 'Piano gratuito utilizzato' : 'Piano gratuito disponibile'}
              </div>
            )}
            {/* Premium upgrade button */}
            {profile?.subscription_plan !== 'premium' && (
              <Button
                variant="gradient"
                size="sm"
                className="w-full mt-4"
                onClick={handleSubscribe}
                loading={subscribing}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Passa a Premium — 10 &euro;/mese
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Totale Speso</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalSpent / 100)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {completedPayments.length} pagament{completedPayments.length === 1 ? 'o' : 'i'} completat{completedPayments.length === 1 ? 'o' : 'i'}
            </p>
          </CardContent>
        </Card>

        {/* Transactions Count */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Transazioni</p>
                <p className="text-lg font-bold text-gray-900">{payments.length}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Totale operazioni registrate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storico Pagamenti</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nessun pagamento registrato</p>
              <p className="text-sm text-gray-400 mt-1">I tuoi pagamenti appariranno qui</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Metodo</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Importo</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const statusConfig = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {TYPE_LABELS[payment.type] || payment.type}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {PROVIDER_LABELS[payment.provider] || payment.provider}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {formatCurrency(payment.amount / 100)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                              statusConfig.color
                            )}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusConfig.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
