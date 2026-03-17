'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STRATEGIES } from '@/types/database';
import { AlertCircle, Sparkles, CreditCard, Loader2, Plus } from 'lucide-react';

export default function NewPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [strategy, setStrategy] = useState<string>('ristrutturazione');

  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState<boolean | null>(null);
  const [freePlanAvailable, setFreePlanAvailable] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const cancelled = searchParams.get('cancelled') === 'true';

  useEffect(() => {
    async function checkProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const [{ data: profile }, { count: creditCount }] = await Promise.all([
        supabase
          .from('profiles')
          .select('free_plan_used, subscription_plan')
          .eq('id', user.id)
          .single(),
        supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('type', 'single_plan')
          .eq('status', 'completed')
          .is('plan_id', null),
      ]);

      if (profile) {
        const credits = creditCount ?? 0;
        setAvailableCredits(credits);

        if (profile.subscription_plan === 'premium') {
          setCanCreate(true);
        } else if (!profile.free_plan_used) {
          setCanCreate(true);
          setFreePlanAvailable(true);
        } else if (credits > 0) {
          setCanCreate(true);
        } else {
          setCanCreate(false);
        }
      }
      setCheckingProfile(false);
    }

    checkProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePurchase = async () => {
    setPurchasing(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'single_plan' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore durante la creazione del pagamento');
        setPurchasing(false);
        return;
      }

      window.location.href = data.sessionUrl;
    } catch {
      setError('Errore di rete. Riprova.');
      setPurchasing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Il nome dell\'operazione e obbligatorio.');
      return;
    }

    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('free_plan_used, subscription_plan')
      .eq('id', user.id)
      .single();

    const isFree =
      profile &&
      profile.subscription_plan === 'free' &&
      !profile.free_plan_used;

    const isPremium = profile?.subscription_plan === 'premium';

    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        location_city: city.trim() || null,
        location_province: province.trim() || null,
        property_type: 'residenziale',
        strategy,
        status: 'draft',
        is_free_plan: !!isFree,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating project:', createError);
      setError('Si e verificato un errore. Riprova.');
      setLoading(false);
      return;
    }

    if (isFree) {
      await supabase
        .from('profiles')
        .update({ free_plan_used: true })
        .eq('id', user.id);
    } else if (!isPremium) {
      const { data: credit } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'single_plan')
        .eq('status', 'completed')
        .is('plan_id', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (credit) {
        await supabase
          .from('payments')
          .update({ plan_id: project.id })
          .eq('id', credit.id)
          .is('plan_id', null);
      }
    }

    router.push(`/plans/${project.id}`);
  };

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show paywall if no access
  if (canCreate === false) {
    return (
      <div className="p-4 md:p-8 max-w-lg mx-auto">
        {cancelled && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 font-medium flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Pagamento annullato. Puoi riprovare quando vuoi.
          </div>
        )}
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="empty-state-icon mx-auto">
              <AlertCircle className="w-9 h-9 text-amber-600" />
            </div>
            <CardTitle className="text-xl">Piano Gratuito Utilizzato</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-5 pt-2">
            <p className="text-sm text-slate-500 leading-relaxed">
              Hai gia utilizzato il tuo piano gratuito. Per creare nuove operazioni,
              acquista un singolo accesso o passa a Premium.
            </p>
            <Button
              variant="gradient"
              size="lg"
              className="w-full gap-2"
              onClick={handlePurchase}
              loading={purchasing}
            >
              <CreditCard className="w-4 h-4" />
              Acquista Operazione — 3,00 &euro;
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/payments')}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Scopri Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="page-header-title">Nuova Operazione</h1>
        <p className="page-header-subtitle">
          Crea una nuova analisi immobiliare
        </p>
        {freePlanAvailable && (
          <span className="mt-3 inline-flex items-center gap-1.5 badge-premium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3 h-3" />
            Piano Gratuito Disponibile
          </span>
        )}
        {!freePlanAvailable && availableCredits > 0 && (
          <span className="mt-3 inline-flex items-center gap-1.5 badge-premium bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3" />
            {availableCredits} credit{availableCredits === 1 ? 'o' : 'i'} disponibil{availableCredits === 1 ? 'e' : 'i'}
          </span>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome Operazione *"
              placeholder="Es. Ristrutturazione Via Roma 12"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input
                  label="Citta"
                  placeholder="Es. Milano"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <Input
                label="Provincia"
                placeholder="MI"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Strategia
              </label>
              <select
                className={cn(
                  'flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200',
                  'focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/15'
                )}
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
              >
                {STRATEGIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full gap-2"
              loading={loading}
            >
              <Plus className="w-4 h-4" />
              Crea Operazione
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
