'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PROPERTY_TYPES, STRATEGIES } from '@/types/database';
import type { Project } from '@/types/database';
import { CheckCircle2, Loader2 } from 'lucide-react';

type ProjectFormData = Pick<
  Project,
  | 'name'
  | 'description'
  | 'location_city'
  | 'location_province'
  | 'location_address'
  | 'property_type'
  | 'strategy'
>;

export default function DatiGeneraliPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const [form, setForm] = useState<ProjectFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch project on mount
  useEffect(() => {
    async function fetchProject() {
      const { data } = await supabase
        .from('projects')
        .select('name, description, location_city, location_province, location_address, property_type, strategy')
        .eq('id', id)
        .single();

      if (data) {
        setForm(data as ProjectFormData);
      }
      setLoading(false);
    }
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-save with debounce
  const saveProject = useCallback(
    async (data: ProjectFormData) => {
      setSaving(true);
      setSaved(false);

      const { error } = await supabase
        .from('projects')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      setSaving(false);

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    },
    [id, supabase]
  );

  const handleChange = useCallback(
    (field: keyof ProjectFormData, value: string) => {
      setForm((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, [field]: value };

        // Debounced save
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          saveProject(updated);
        }, 1000);

        return updated;
      });
    },
    [saveProject]
  );

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dati Generali</h1>
            <p className="mt-1 text-sm text-gray-500">
              Informazioni principali dell&apos;operazione immobiliare
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {saving && (
              <span className="flex items-center gap-1.5 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvataggio...
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Salvato
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Operazione */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nome Operazione"
              placeholder="Es. Ristrutturazione Via Roma 12"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descrizione
              </label>
              <textarea
                className={cn(
                  'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors',
                  'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'min-h-[100px] resize-y'
                )}
                placeholder="Descrizione dell'operazione..."
                value={form.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Localizzazione */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Localizzazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input
                  label="Citta"
                  placeholder="Es. Milano"
                  value={form.location_city ?? ''}
                  onChange={(e) => handleChange('location_city', e.target.value)}
                />
              </div>
              <Input
                label="Provincia"
                placeholder="MI"
                value={form.location_province ?? ''}
                onChange={(e) => handleChange('location_province', e.target.value)}
              />
            </div>
            <Input
              label="Indirizzo"
              placeholder="Es. Via Roma 12"
              value={form.location_address ?? ''}
              onChange={(e) => handleChange('location_address', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Tipologia e Strategia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipologia e Strategia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipologia Immobile
              </label>
              <select
                className={cn(
                  'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors',
                  'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                )}
                value={form.property_type}
                onChange={(e) => handleChange('property_type', e.target.value)}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
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
                value={form.strategy}
                onChange={(e) => handleChange('strategy', e.target.value)}
              >
                {STRATEGIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
