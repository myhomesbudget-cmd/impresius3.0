'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STRATEGIES } from '@/types/database';
import { AlertCircle, Sparkles, CreditCard, Loader2, Plus } from 'lucide-react';

export default function NewPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Check creation rights via server-side API
  useEffect(() => {
    async function checkRights() {
      try {
        const res = await fetch('/api/projects/check-rights');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) {
          setCanCreate(false);
          setCheckingProfile(false);
          return;
        }
        const data = await res.json();
        setCanCreate(data.canCreate);
        setFreePlanAvailable(data.freePlanAvailable);
        setAvailableCredits(data.availableCredits);
      } catch {
        setCanCreate(false);
      }
      setCheckingProfile(false);
    }

    checkRights();
  }, [router]);

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

  // Submit: delegate ALL business logic to server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Il nome dell'operazione e obbligatorio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          locationCity: city.trim() || undefined,
          locationProvince: province.trim() || undefined,
          strategy,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Si e verificato un errore. Riprova.');
        setLoading(false);
        return;
      }

      router.push(`/plans/${data.project.id}`);
    } catch {
      setError('Errore di rete. Riprova.');
      setLoading(false);
    }
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
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-500/10 dark:bg-amber-500/20 p-4 text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5 shadow-sm">
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
            <p className="text-sm text-muted-foreground leading-relaxed">
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
          <span className="mt-3 inline-flex items-center gap-1.5 badge-premium bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
            <Sparkles className="w-3 h-3" />
            Piano Gratuito Disponibile
          </span>
        )}
        {!freePlanAvailable && availableCredits > 0 && (
          <span className="mt-3 inline-flex items-center gap-1.5 badge-premium bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="block text-sm font-semibold text-foreground mb-2">
                Strategia
              </label>
              <select
                className={cn(
                  'flex h-11 w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground transition-all duration-200',
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
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium bg-red-500/10 dark:bg-red-500/20 border border-red-200 rounded-lg px-3 py-2.5">
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
