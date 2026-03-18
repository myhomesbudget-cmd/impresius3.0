'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { calculateProjectResults } from '@/lib/calculations';
import type {
  Project,
  ProjectResults,
  PropertyUnit,
  UnitSurface,
  AcquisitionCost,
  OperationCost,
  ConstructionItem,
  Measurement,
  ActualCost,
} from '@/types/database';
import {
  Activity,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ActualCostForm {
  reference_type: 'acquisition' | 'operation' | 'construction';
  description: string;
  amount: string;
  date: string;
  invoice_number: string;
  notes: string;
}

const EMPTY_FORM: ActualCostForm = {
  reference_type: 'construction',
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  invoice_number: '',
  notes: '',
};

const REFERENCE_LABELS: Record<string, string> = {
  acquisition: 'Acquisizione',
  operation: 'Operativi',
  construction: 'Costruzione',
};

export default function MonitoringPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [baseResults, setBaseResults] = useState<ProjectResults | null>(null);
  const [actualCosts, setActualCosts] = useState<ActualCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ActualCostForm>(EMPTY_FORM);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [
        { data: projectData },
        { data: units },
        { data: surfaces },
        { data: acquisitionCosts },
        { data: operationCosts },
        { data: constructionItems },
        { data: measurements },
        { data: actuals },
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('property_units').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('unit_surfaces').select('*').order('sort_order'),
        supabase.from('acquisition_costs').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('operation_costs').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('construction_items').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('measurements').select('*').order('sort_order'),
        supabase.from('actual_costs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      ]);

      if (projectData) setProject(projectData as Project);

      const unitIds = (units || []).map((u: PropertyUnit) => u.id);
      const projectSurfaces = (surfaces || []).filter((s: UnitSurface) => unitIds.includes(s.unit_id));
      const itemIds = (constructionItems || []).map((i: ConstructionItem) => i.id);
      const projectMeasurements = (measurements || []).filter((m: Measurement) => itemIds.includes(m.item_id));

      const base = calculateProjectResults(
        (units || []) as PropertyUnit[],
        projectSurfaces as UnitSurface[],
        (acquisitionCosts || []) as AcquisitionCost[],
        (operationCosts || []) as OperationCost[],
        (constructionItems || []) as ConstructionItem[],
        projectMeasurements as Measurement[],
      );
      setBaseResults(base);
      setActualCosts((actuals || []) as ActualCost[]);
      setLoading(false);
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const addActualCost = async () => {
    if (!form.description || !form.amount) return;
    setSaving(true);

    const { data: inserted } = await supabase
      .from('actual_costs')
      .insert({
        project_id: projectId,
        reference_type: form.reference_type,
        description: form.description,
        amount: parseFloat(form.amount),
        date: form.date || null,
        invoice_number: form.invoice_number || null,
        notes: form.notes || null,
      })
      .select()
      .single();

    if (inserted) {
      setActualCosts((prev) => [inserted as ActualCost, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    }
    setSaving(false);
  };

  const deleteActualCost = async (id: string) => {
    await supabase.from('actual_costs').delete().eq('id', id);
    setActualCosts((prev) => prev.filter((c) => c.id !== id));
  };

  // Aggregate actual costs by type
  const actualTotals = useMemo(() => {
    const totals = { acquisition: 0, operation: 0, construction: 0, total: 0 };
    for (const cost of actualCosts) {
      totals[cost.reference_type] += cost.amount;
      totals.total += cost.amount;
    }
    return totals;
  }, [actualCosts]);

  if (loading || !baseResults || !project) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Comparison data
  const categories = [
    { key: 'acquisition', label: 'Acquisizione', budget: baseResults.total_acquisition_cost, actual: actualTotals.acquisition },
    { key: 'operation', label: 'Operativi', budget: baseResults.total_operation_cost, actual: actualTotals.operation },
    { key: 'construction', label: 'Costruzione', budget: baseResults.total_construction_cost, actual: actualTotals.construction },
  ];

  const totalBudget = baseResults.total_cost;
  const totalActual = actualTotals.total;
  const totalDelta = totalActual - totalBudget;
  const totalProgress = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  // Chart data
  const chartData = categories.map((cat) => ({
    name: cat.label,
    Preventivo: Math.round(cat.budget),
    Effettivo: Math.round(cat.actual),
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header-title flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Monitoring Costi
          </h1>
          <p className="page-header-subtitle">
            Confronta i costi effettivi con il preventivo per &ldquo;{project.name}&rdquo;
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Registra Costo
        </Button>
      </div>

      {/* Add Cost Form */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Nuovo Costo Effettivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Categoria</label>
                <select
                  value={form.reference_type}
                  onChange={(e) => setForm({ ...form, reference_type: e.target.value as ActualCostForm['reference_type'] })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-[3px] focus:ring-blue-500/15"
                >
                  <option value="acquisition">Acquisizione</option>
                  <option value="operation">Operativi</option>
                  <option value="construction">Costruzione</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Descrizione</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Es: Fattura impresa edile"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Importo</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Data</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nr. Fattura</label>
                <Input
                  value={form.invoice_number}
                  onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                  placeholder="Opzionale"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Note</label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Opzionale"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
                Annulla
              </Button>
              <Button onClick={addActualCost} disabled={saving || !form.description || !form.amount}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Salva
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Budget */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preventivo Totale</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>

        {/* Total Actual */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Effettivo Totale</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(totalActual)}</p>
            <div className="mt-2">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    totalProgress <= 100 ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                  style={{ width: `${Math.min(totalProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{totalProgress.toFixed(1)}% del budget</p>
            </div>
          </CardContent>
        </Card>

        {/* Delta */}
        <Card className={cn(
          'border-2',
          totalDelta > 0 ? 'border-red-200' : totalDelta < 0 ? 'border-emerald-200' : 'border-border'
        )}>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scostamento</p>
            <div className="flex items-center gap-2 mt-1">
              {totalDelta > 0 ? (
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              ) : totalDelta < 0 ? (
                <ArrowDownRight className="w-5 h-5 text-emerald-500" />
              ) : null}
              <p className={cn(
                'text-xl font-bold',
                totalDelta > 0 ? 'text-red-600' : totalDelta < 0 ? 'text-emerald-600' : 'text-foreground'
              )}>
                {totalDelta > 0 ? '+' : ''}{formatCurrency(totalDelta)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDelta > 0 ? 'Sopra il budget' : totalDelta < 0 ? 'Sotto il budget' : 'In linea'}
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stato</p>
            <div className="flex items-center gap-2 mt-2">
              {totalDelta > totalBudget * 0.1 ? (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">Fuori Budget</span>
                </>
              ) : totalDelta > 0 ? (
                <>
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">Attenzione</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">In Budget</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Cards */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Dettaglio per Categoria</h2>
          {categories.map((cat) => {
            const delta = cat.actual - cat.budget;
            const progress = cat.budget > 0 ? (cat.actual / cat.budget) * 100 : 0;

            return (
              <Card key={cat.key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">{cat.label}</h3>
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      delta > 0 ? 'bg-red-100 text-red-700' :
                      delta < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-foreground'
                    )}>
                      {delta > 0 ? '+' : ''}{formatCurrency(delta)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Preventivo</span>
                      <p className="font-semibold text-foreground">{formatCurrency(cat.budget)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effettivo</span>
                      <p className="font-semibold text-foreground">{formatCurrency(cat.actual)}</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        progress <= 90 ? 'bg-emerald-500' :
                        progress <= 100 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}%</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Preventivo vs Effettivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `€ ${Math.round(v / 1000)}k`}
                  />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="Preventivo" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Effettivo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actual Costs List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registro Costi Effettivi</CardTitle>
        </CardHeader>
        <CardContent>
          {actualCosts.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Nessun costo effettivo registrato</p>
              <p className="text-sm text-muted-foreground mt-1">Clicca &ldquo;Registra Costo&rdquo; per iniziare il monitoraggio</p>
            </div>
          ) : (
            <div className="overflow-x-auto mobile-scroll-hint">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Descrizione</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nr. Fattura</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Importo</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {actualCosts.map((cost) => (
                    <tr key={cost.id} className="border-b border-border hover:bg-accent">
                      <td className="py-3 px-4 text-foreground">
                        {cost.date ? formatDate(cost.date) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                          {REFERENCE_LABELS[cost.reference_type]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground">{cost.description}</td>
                      <td className="py-3 px-4 text-muted-foreground">{cost.invoice_number || '—'}</td>
                      <td className="py-3 px-4 text-right font-semibold text-foreground">
                        {formatCurrency(cost.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteActualCost(cost.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
