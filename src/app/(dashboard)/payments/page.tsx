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
  completed: { label: 'Completato', icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20' },
  pending: { label: 'In attesa', icon: Clock, color: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20' },
  failed: { label: 'Fallito', icon: XCircle, color: 'text-red-700 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20' },
  refunded: { label: 'Rimborsato', icon: RefreshCw, color: 'text-blue-700 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20' },
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
        <div className="glass-panel-static !rounded-xl p-4 flex items-start gap-3 !border-emerald-500/20">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/15 mt-0.5 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-700">Pagamento completato con successo!</p>
            <p className="text-sm text-emerald-600/70 mt-1">
              Il tuo acquisto e stato registrato.{' '}
              <button
                onClick={() => router.push('/plans/new')}
                className="underline font-semibold hover:text-emerald-800"
              >
                Crea una nuova operazione
              </button>
            </p>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="glass-panel-static !rounded-xl p-4 flex items-start gap-3 !border-amber-500/20">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 border border-amber-500/15 mt-0.5 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-700">Pagamento annullato</p>
            <p className="text-sm text-amber-600/70 mt-1">
              Il pagamento non e stato completato. Puoi riprovare in qualsiasi momento.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A24] tracking-tight">Pagamenti</h1>
        <p className="text-[#1A1A24]/40 text-sm mt-1">
          Gestisci il tuo abbonamento e visualizza lo storico dei pagamenti
        </p>
      </div>

      {/* Plan & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Plan */}
        <div className="glass-panel glass-accent-purple">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7B61FF]/10 border border-[#7B61FF]/15">
                <Crown className="w-5 h-5 text-[#7B61FF]" />
              </div>
              <div>
                <p className="metric-label">Piano Attuale</p>
                <p className="text-lg font-bold text-foreground">
                  {profile ? PLAN_LABELS[profile.subscription_plan] || profile.subscription_plan : '—'}
                </p>
              </div>
            </div>
            {profile?.subscription_plan === 'premium' && profile?.subscription_expires_at && (
              <p className="text-xs font-medium text-muted-foreground">
                Scade il {formatDate(profile.subscription_expires_at)}
              </p>
            )}
            {profile?.subscription_plan === 'free' && (
              <div className={cn('badge-premium mt-1', 'bg-muted text-muted-foreground border border-border')}>
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
        <div className="glass-panel glass-accent-cyan">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00C2FF]/10 border border-[#00C2FF]/15">
                <CreditCard className="w-5 h-5 text-[#00C2FF]" />
              </div>
              <div>
                <p className="metric-label">Totale Speso</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalSpent / 100)}</p>
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {completedPayments.length} pagament{completedPayments.length === 1 ? 'o' : 'i'} completat{completedPayments.length === 1 ? 'o' : 'i'}
            </p>
          </div>
        </div>

        {/* Transactions Count */}
        <div className="glass-panel glass-accent-pink">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FF2D55]/10 border border-[#FF2D55]/15">
                <Receipt className="w-5 h-5 text-[#FF2D55]" />
              </div>
              <div>
                <p className="metric-label">Transazioni</p>
                <p className="text-lg font-bold text-foreground">{payments.length}</p>
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              Totale operazioni registrate
            </p>
          </div>
        </div>
      </div>

      {/* Payments History */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="icon-container icon-container-sm rounded-lg bg-muted">
              <Receipt className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle>Storico Pagamenti</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="empty-state-icon mx-auto">
                <Receipt className="w-9 h-9 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold">Nessun pagamento registrato</p>
              <p className="text-sm text-muted-foreground mt-1">I tuoi pagamenti appariranno qui</p>
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
                        <td className="font-medium text-foreground">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="text-foreground">
                          {TYPE_LABELS[payment.type] || payment.type}
                        </td>
                        <td className="text-foreground">
                          {PROVIDER_LABELS[payment.provider] || payment.provider}
                        </td>
                        <td className="text-right font-bold text-foreground">
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
