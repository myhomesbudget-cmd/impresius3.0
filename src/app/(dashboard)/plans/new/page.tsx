'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STRATEGIES } from '@/types/database';
import { AlertCircle, Sparkles } from 'lucide-react';

export default function NewPlanPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [strategy, setStrategy] = useState<string>('ristrutturazione');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState<boolean | null>(null);
  const [freePlanUsed, setFreePlanUsed] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Check user profile on mount
  useEffect(() => {
    async function checkProfile() {
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

      if (profile) {
        const hasPaidPlan =
          profile.subscription_plan === 'pay_per_plan' ||
          profile.subscription_plan === 'premium';

        if (hasPaidPlan) {
          setCanCreate(true);
        } else if (!profile.free_plan_used) {
          setCanCreate(true);
          setFreePlanUsed(false);
        } else {
          setCanCreate(false);
          setFreePlanUsed(true);
        }
      }
      setCheckingProfile(false);
    }

    checkProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // Determine if this is a free plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('free_plan_used, subscription_plan')
      .eq('id', user.id)
      .single();

    const isFree =
      profile &&
      profile.subscription_plan === 'free' &&
      !profile.free_plan_used;

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

    // Mark free plan as used
    if (isFree) {
      await supabase
        .from('profiles')
        .update({ free_plan_used: true })
        .eq('id', user.id);
    }

    router.push(`/plans/${project.id}`);
  };

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show upgrade prompt if free plan already used
  if (canCreate === false && freePlanUsed) {
    return (
      <div className="p-8 max-w-lg mx-auto">
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
              passa a un piano a pagamento.
            </p>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => router.push('/payments')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Scopri i Piani
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
        {canCreate && !freePlanUsed && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <Sparkles className="w-3 h-3" />
            Piano Gratuito Disponibile
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
