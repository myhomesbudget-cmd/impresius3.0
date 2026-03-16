'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STRATEGIES } from '@/types/database';
import { AlertCircle, Sparkles, CreditCard, Loader2 } from 'lucide-react';

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

      // Fetch profile and available credits in parallel
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

      // Redirect to Stripe Checkout
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

    // Re-fetch profile to avoid stale state
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

    // Create the project
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

    // Post-creation: consume the appropriate access right
    if (isFree) {
      // Mark free plan as used
      await supabase
        .from('profiles')
        .update({ free_plan_used: true })
        .eq('id', user.id);
    } else if (!isPremium) {
      // Consume one available credit: find the oldest unlinked payment and link it.
      // We use .limit(1) and order by created_at to ensure deterministic selection.
      // Race condition mitigation: if the update affects 0 rows (another tab consumed it),
      // the project is already created — worst case the credit is consumed elsewhere.
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
          .is('plan_id', null); // Double-check: only update if still unlinked
      }
    }
    // Premium users: no credit consumed, unlimited access

    router.push(`/plans/${project.id}`);
  };

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show paywall if no access
  if (canCreate === false) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        {cancelled && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Pagamento annullato. Puoi riprovare quando vuoi.
          </div>
        )}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle>Piano Gratuito Utilizzato</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Hai gia utilizzato il tuo piano gratuito. Per creare nuove operazioni,
              acquista un singolo accesso o passa a Premium.
            </p>
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handlePurchase}
              loading={purchasing}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Acquista Operazione — 3,00 &euro;
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/payments')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Scopri Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Nuova Operazione</h1>
        <p className="mt-1 text-sm text-gray-500">
          Crea una nuova analisi immobiliare
        </p>
        {freePlanAvailable && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <Sparkles className="w-3 h-3" />
            Piano Gratuito Disponibile
          </span>
        )}
        {!freePlanAvailable && availableCredits > 0 && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Strategia
              </label>
              <select
                className={cn(
                  'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors',
                  'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
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
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Crea Operazione
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
