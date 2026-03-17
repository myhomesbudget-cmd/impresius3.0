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
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  completed: { label: 'Completato', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' },
  pending: { label: 'In attesa', icon: Clock, color: 'text-amber-700 bg-amber-50 border border-amber-200' },
  failed: { label: 'Fallito', icon: XCircle, color: 'text-red-700 bg-red-50 border border-red-200' },
  refunded: { label: 'Rimborsato', icon: RefreshCw, color: 'text-blue-700 bg-blue-50 border border-blue-200' },
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
      <div className="p-4 md:p-8 max-w-5xl">
        <div className="h-9 w-48 rounded-lg animate-shimmer mb-3" />
        <div className="h-5 w-64 rounded-lg animate-shimmer mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl animate-shimmer" />
          ))}
        </div>
        <div className="h-64 rounded-xl animate-shimmer" />
      </div>
    );
  }

  const completedPayments = payments.filter((p) => p.status === 'completed');
  const totalSpent = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl space-y-10">
      {/* Success / Cancel Banners */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3 shadow-sm">
          <div className="icon-container icon-container-sm rounded-lg bg-emerald-100 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Pagamento completato con successo!</p>
            <p className="text-sm text-emerald-700 mt-1">
              Il tuo acquisto e stato registrato.{' '}
              <button
                onClick={() => router.push('/plans/new')}
                className="underline font-semibold hover:text-emerald-900"
              >
                Crea una nuova operazione
              </button>
            </p>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 shadow-sm">
          <div className="icon-container icon-container-sm rounded-lg bg-amber-100 mt-0.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Pagamento annullato</p>
            <p className="text-sm text-amber-700 mt-1">
              Il pagamento non e stato completato. Puoi riprovare in qualsiasi momento.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="page-header-title">Pagamenti</h1>
        <p className="page-header-subtitle">
          Gestisci il tuo abbonamento e visualizza lo storico dei pagamenti
        </p>
      </div>

      {/* Plan & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Plan */}
        <div className="kpi-card kpi-card-indigo">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-container icon-container-md rounded-xl bg-indigo-50">
                <Crown className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="metric-label">Piano Attuale</p>
                <p className="text-lg font-bold text-slate-900">
                  {profile ? PLAN_LABELS[profile.subscription_plan] || profile.subscription_plan : '—'}
                </p>
              </div>
            </div>
            {profile?.subscription_plan === 'premium' && profile?.subscription_expires_at && (
              <p className="text-xs font-medium text-slate-500">
                Scade il {formatDate(profile.subscription_expires_at)}
              </p>
            )}
            {profile?.subscription_plan === 'free' && (
              <div className={cn('badge-premium mt-1', 'bg-slate-50 text-slate-600 border border-slate-200')}>
                {profile.free_plan_used ? 'Piano gratuito utilizzato' : 'Piano gratuito disponibile'}
              </div>
            )}
            {profile?.subscription_plan !== 'premium' && (
              <Button
                variant="gradient"
                size="sm"
                className="w-full mt-4 gap-1.5"
                onClick={handleSubscribe}
                loading={subscribing}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Passa a Premium — 10 &euro;/mese
              </Button>
            )}
          </div>
        </div>

        {/* Total Spent */}
        <div className="kpi-card kpi-card-emerald">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-container icon-container-md rounded-xl bg-emerald-50">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="metric-label">Totale Speso</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(totalSpent / 100)}</p>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              {completedPayments.length} pagament{completedPayments.length === 1 ? 'o' : 'i'} completat{completedPayments.length === 1 ? 'o' : 'i'}
            </p>
          </div>
        </div>

        {/* Transactions Count */}
        <div className="kpi-card kpi-card-blue">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-container icon-container-md rounded-xl bg-blue-50">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="metric-label">Transazioni</p>
                <p className="text-lg font-bold text-slate-900">{payments.length}</p>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Totale operazioni registrate
            </p>
          </div>
        </div>
      </div>

      {/* Payments History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="icon-container icon-container-sm rounded-lg bg-slate-100">
              <Receipt className="w-4 h-4 text-slate-600" />
            </div>
            <CardTitle>Storico Pagamenti</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="empty-state-icon mx-auto">
                <Receipt className="w-9 h-9 text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold">Nessun pagamento registrato</p>
              <p className="text-sm text-slate-400 mt-1">I tuoi pagamenti appariranno qui</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full table-premium">
                <thead>
                  <tr>
                    <th className="text-left">Data</th>
                    <th className="text-left">Tipo</th>
                    <th className="text-left">Metodo</th>
                    <th className="text-right">Importo</th>
                    <th className="text-center">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const statusConfig = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={payment.id}>
                        <td className="font-medium text-slate-900">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="text-slate-700">
                          {TYPE_LABELS[payment.type] || payment.type}
                        </td>
                        <td className="text-slate-700">
                          {PROVIDER_LABELS[payment.provider] || payment.provider}
                        </td>
                        <td className="text-right font-bold text-slate-900">
                          {formatCurrency(payment.amount / 100)}
                        </td>
                        <td>
                          <div className="flex justify-center">
                            <span className={cn(
                              'badge-premium',
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
