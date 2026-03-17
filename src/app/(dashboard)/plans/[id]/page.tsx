'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PROPERTY_TYPES, STRATEGIES } from '@/types/database';
import type { Project } from '@/types/database';
import { CheckCircle2, Loader2, FileText, MapPin, Settings2 } from 'lucide-react';

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
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header-title">Dati Generali</h1>
            <p className="page-header-subtitle">
              Informazioni principali dell&apos;operazione immobiliare
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {saving && (
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvataggio...
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Salvato
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-8">
        {/* Operazione */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-blue-50">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle>Operazione</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Nome Operazione"
              placeholder="Es. Ristrutturazione Via Roma 12"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descrizione
              </label>
              <textarea
                className={cn(
                  'flex w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200',
                  'placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/15',
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
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-emerald-50">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <CardTitle>Localizzazione</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
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
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-indigo-50">
                <Settings2 className="w-4 h-4 text-indigo-600" />
              </div>
              <CardTitle>Tipologia e Strategia</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tipologia Immobile
              </label>
              <select
                className={cn(
                  'flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200',
                  'focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/15'
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Strategia
              </label>
              <select
                className={cn(
                  'flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200',
                  'focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/15'
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
