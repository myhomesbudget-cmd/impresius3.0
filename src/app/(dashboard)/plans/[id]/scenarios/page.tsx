'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { calculateProjectResults } from '@/lib/calculations';
import type {
  Project,
  Scenario,
  ProjectResults,
  PropertyUnit,
  UnitSurface,
  AcquisitionCost,
  OperationCost,
  ConstructionItem,
  Measurement,
} from '@/types/database';
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  Rocket,
  Sliders,
  BarChart3,
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
  Cell,
} from 'recharts';

// Default scenario presets
const SCENARIO_PRESETS: Pick<Scenario, 'name' | 'type' | 'sale_price_variation' | 'construction_cost_variation' | 'acquisition_cost_variation'>[] = [
  {
    name: 'Prudente',
    type: 'conservative',
    sale_price_variation: -10,
    construction_cost_variation: 15,
    acquisition_cost_variation: 5,
  },
  {
    name: 'Realistico',
    type: 'realistic',
    sale_price_variation: 0,
    construction_cost_variation: 0,
    acquisition_cost_variation: 0,
  },
  {
    name: 'Ottimistico',
    type: 'optimistic',
    sale_price_variation: 10,
    construction_cost_variation: -5,
    acquisition_cost_variation: -3,
  },
];

const SCENARIO_ICONS: Record<string, typeof ShieldAlert> = {
  conservative: ShieldAlert,
  realistic: Target,
  optimistic: Rocket,
  custom: Sliders,
};

const SCENARIO_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  conservative: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: '#f59e0b' },
  realistic: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: '#3b82f6' },
  optimistic: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: '#10b981' },
  custom: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', bar: '#8b5cf6' },
};

const SCENARIO_TYPE_LABELS: Record<string, string> = {
  conservative: 'Prudente',
  realistic: 'Realistico',
  optimistic: 'Ottimistico',
  custom: 'Personalizzato',
};

interface ScenarioWithResults extends Scenario {
  computed_results: ProjectResults;
}

export default function ScenariosPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioWithResults[]>([]);
  const [baseResults, setBaseResults] = useState<ProjectResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Raw data for recalculation
  const [rawData, setRawData] = useState<{
    units: PropertyUnit[];
    surfaces: UnitSurface[];
    acquisitionCosts: AcquisitionCost[];
    operationCosts: OperationCost[];
    constructionItems: ConstructionItem[];
    measurements: Measurement[];
  } | null>(null);

  const applyVariations = useCallback((
    data: NonNullable<typeof rawData>,
    scenario: Pick<Scenario, 'sale_price_variation' | 'construction_cost_variation' | 'acquisition_cost_variation'>
  ): ProjectResults => {
    const saleFactor = 1 + scenario.sale_price_variation / 100;
    const constructionFactor = 1 + scenario.construction_cost_variation / 100;
    const acquisitionFactor = 1 + scenario.acquisition_cost_variation / 100;

    // Clone and adjust units (sale price variation)
    const adjustedUnits = data.units.map((u) => ({
      ...u,
      target_sale_price: Math.round(u.target_sale_price * saleFactor * 100) / 100,
      market_price_sqm: Math.round(u.market_price_sqm * saleFactor * 100) / 100,
    }));

    // Clone and adjust construction items
    const adjustedItems = data.constructionItems.map((item) => ({
      ...item,
      unit_price: Math.round(item.unit_price * constructionFactor * 100) / 100,
    }));

    // Clone and adjust acquisition costs
    const adjustedAcquisition = data.acquisitionCosts.map((cost) => ({
      ...cost,
      fixed_amount: Math.round(cost.fixed_amount * acquisitionFactor * 100) / 100,
      base_value: Math.round(cost.base_value * acquisitionFactor * 100) / 100,
    }));

    return calculateProjectResults(
      adjustedUnits,
      data.surfaces,
      adjustedAcquisition,
      data.operationCosts,
      adjustedItems,
      data.measurements
    );
  }, []);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);

      const [
        { data: projectData },
        { data: units },
        { data: surfaces },
        { data: acquisitionCosts },
        { data: operationCosts },
        { data: constructionItems },
        { data: measurements },
        { data: scenariosData },
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('property_units').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('unit_surfaces').select('*').order('sort_order'),
        supabase.from('acquisition_costs').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('operation_costs').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('construction_items').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('measurements').select('*').order('sort_order'),
        supabase.from('scenarios').select('*').eq('project_id', projectId).order('created_at'),
      ]);

      if (projectData) setProject(projectData as Project);

      const unitIds = (units || []).map((u: PropertyUnit) => u.id);
      const projectSurfaces = (surfaces || []).filter((s: UnitSurface) => unitIds.includes(s.unit_id));
      const itemIds = (constructionItems || []).map((i: ConstructionItem) => i.id);
      const projectMeasurements = (measurements || []).filter((m: Measurement) => itemIds.includes(m.item_id));

      const data = {
        units: (units || []) as PropertyUnit[],
        surfaces: projectSurfaces as UnitSurface[],
        acquisitionCosts: (acquisitionCosts || []) as AcquisitionCost[],
        operationCosts: (operationCosts || []) as OperationCost[],
        constructionItems: (constructionItems || []) as ConstructionItem[],
        measurements: projectMeasurements as Measurement[],
      };
      setRawData(data);

      // Calculate base results (no variation)
      const base = calculateProjectResults(
        data.units, data.surfaces, data.acquisitionCosts,
        data.operationCosts, data.constructionItems, data.measurements
      );
      setBaseResults(base);

      // If no scenarios exist, create the 3 default ones
      const existingScenarios = (scenariosData || []) as Scenario[];
      if (existingScenarios.length === 0) {
        const created: ScenarioWithResults[] = [];
        for (const preset of SCENARIO_PRESETS) {
          const computed = applyVariations(data, preset);
          const { data: inserted } = await supabase
            .from('scenarios')
            .insert({
              project_id: projectId,
              name: preset.name,
              type: preset.type,
              sale_price_variation: preset.sale_price_variation,
              construction_cost_variation: preset.construction_cost_variation,
              acquisition_cost_variation: preset.acquisition_cost_variation,
              results_snapshot: computed as unknown as Record<string, unknown>,
            })
            .select()
            .single();
          if (inserted) {
            created.push({ ...(inserted as Scenario), computed_results: computed });
          }
        }
        setScenarios(created);
      } else {
        // Recalculate results for existing scenarios from current data
        const withResults: ScenarioWithResults[] = existingScenarios.map((s) => ({
          ...s,
          computed_results: applyVariations(data, s),
        }));
        setScenarios(withResults);
      }

      setLoading(false);
    }

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const updateScenarioField = (
    scenarioId: string,
    field: 'sale_price_variation' | 'construction_cost_variation' | 'acquisition_cost_variation' | 'name',
    value: string
  ) => {
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id !== scenarioId) return s;
        if (field === 'name') return { ...s, name: value };
        const numValue = parseFloat(value) || 0;
        const updated = { ...s, [field]: numValue };
        if (rawData) {
          updated.computed_results = applyVariations(rawData, updated);
        }
        return updated;
      })
    );
  };

  const saveScenario = async (scenario: ScenarioWithResults) => {
    setSaving(scenario.id);
    await supabase
      .from('scenarios')
      .update({
        name: scenario.name,
        sale_price_variation: scenario.sale_price_variation,
        construction_cost_variation: scenario.construction_cost_variation,
        acquisition_cost_variation: scenario.acquisition_cost_variation,
        results_snapshot: scenario.computed_results as unknown as Record<string, unknown>,
      })
      .eq('id', scenario.id);
    setSaving(null);
  };

  const addCustomScenario = async () => {
    if (!rawData) return;
    const preset = { sale_price_variation: 0, construction_cost_variation: 0, acquisition_cost_variation: 0 };
    const computed = applyVariations(rawData, preset);
    const { data: inserted } = await supabase
      .from('scenarios')
      .insert({
        project_id: projectId,
        name: `Scenario ${scenarios.length + 1}`,
        type: 'custom',
        ...preset,
        results_snapshot: computed as unknown as Record<string, unknown>,
      })
      .select()
      .single();
    if (inserted) {
      setScenarios((prev) => [...prev, { ...(inserted as Scenario), computed_results: computed }]);
    }
  };

  const deleteScenario = async (id: string) => {
    await supabase.from('scenarios').delete().eq('id', id);
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading || !baseResults) {
    return (
      <div className="p-8 max-w-7xl">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Build comparison chart data
  const comparisonMetrics = [
    { key: 'revenue', label: 'Ricavo Totale', getValue: (r: ProjectResults) => r.total_revenue },
    { key: 'cost', label: 'Costo Totale', getValue: (r: ProjectResults) => r.total_cost },
    { key: 'margin', label: 'Margine', getValue: (r: ProjectResults) => r.gross_margin },
  ];

  const chartData = comparisonMetrics.map((metric) => {
    const row: Record<string, string | number> = { name: metric.label };
    for (const s of scenarios) {
      row[s.name] = Math.round(metric.getValue(s.computed_results));
    }
    return row;
  });

  const roiChartData = scenarios.map((s) => ({
    name: s.name,
    ROI: s.computed_results.roi,
    'Utile su Ricavi': s.computed_results.margin_on_revenue,
    type: s.type,
  }));

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analisi Scenari</h1>
          {project && (
            <p className="mt-1 text-sm text-gray-500">
              Confronta scenari economici per &ldquo;{project.name}&rdquo;
            </p>
          )}
        </div>
        <Button onClick={addCustomScenario} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Aggiungi Scenario
        </Button>
      </div>

      {/* Base Reference */}
      <Card className="mb-8 border-gray-300 bg-gray-50">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Valori Base (dati attuali senza variazioni)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500">Ricavo Totale</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(baseResults.total_revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Costo Totale</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(baseResults.total_cost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Margine</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(baseResults.gross_margin)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ROI</p>
              <p className="text-sm font-semibold text-gray-900">{formatPercentage(baseResults.roi)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Utile su Ricavi</p>
              <p className="text-sm font-semibold text-gray-900">{formatPercentage(baseResults.margin_on_revenue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {scenarios.map((scenario) => {
          const colors = SCENARIO_COLORS[scenario.type] || SCENARIO_COLORS.custom;
          const Icon = SCENARIO_ICONS[scenario.type] || Sliders;
          const r = scenario.computed_results;
          const marginPositive = r.gross_margin >= 0;
          const deltaMargin = r.gross_margin - baseResults.gross_margin;

          return (
            <Card key={scenario.id} className={cn('border-2', colors.border)}>
              <CardHeader className={cn('pb-3', colors.bg)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('w-5 h-5', colors.text)} />
                    <Input
                      value={scenario.name}
                      onChange={(e) => updateScenarioField(scenario.id, 'name', e.target.value)}
                      className="h-7 text-sm font-semibold border-none bg-transparent p-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => saveScenario(scenario)}
                      disabled={saving === scenario.id}
                      className="h-7 w-7 p-0"
                      title="Salva"
                    >
                      {saving === scenario.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    {scenario.type === 'custom' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteScenario(scenario.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <span className={cn('text-xs font-medium', colors.text)}>
                  {SCENARIO_TYPE_LABELS[scenario.type]}
                </span>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Variation Sliders */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 flex justify-between">
                      <span>Prezzo Vendita</span>
                      <span className={cn(
                        'font-semibold',
                        scenario.sale_price_variation > 0 ? 'text-emerald-600' :
                        scenario.sale_price_variation < 0 ? 'text-red-600' : 'text-gray-600'
                      )}>
                        {scenario.sale_price_variation > 0 ? '+' : ''}{scenario.sale_price_variation}%
                      </span>
                    </label>
                    <Input
                      type="range"
                      min={-30}
                      max={30}
                      step={1}
                      value={scenario.sale_price_variation}
                      onChange={(e) => updateScenarioField(scenario.id, 'sale_price_variation', e.target.value)}
                      className="h-2 p-0 mt-1 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 flex justify-between">
                      <span>Costi Costruzione</span>
                      <span className={cn(
                        'font-semibold',
                        scenario.construction_cost_variation < 0 ? 'text-emerald-600' :
                        scenario.construction_cost_variation > 0 ? 'text-red-600' : 'text-gray-600'
                      )}>
                        {scenario.construction_cost_variation > 0 ? '+' : ''}{scenario.construction_cost_variation}%
                      </span>
                    </label>
                    <Input
                      type="range"
                      min={-30}
                      max={30}
                      step={1}
                      value={scenario.construction_cost_variation}
                      onChange={(e) => updateScenarioField(scenario.id, 'construction_cost_variation', e.target.value)}
                      className="h-2 p-0 mt-1 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 flex justify-between">
                      <span>Costi Acquisizione</span>
                      <span className={cn(
                        'font-semibold',
                        scenario.acquisition_cost_variation < 0 ? 'text-emerald-600' :
                        scenario.acquisition_cost_variation > 0 ? 'text-red-600' : 'text-gray-600'
                      )}>
                        {scenario.acquisition_cost_variation > 0 ? '+' : ''}{scenario.acquisition_cost_variation}%
                      </span>
                    </label>
                    <Input
                      type="range"
                      min={-30}
                      max={30}
                      step={1}
                      value={scenario.acquisition_cost_variation}
                      onChange={(e) => updateScenarioField(scenario.id, 'acquisition_cost_variation', e.target.value)}
                      className="h-2 p-0 mt-1 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Results */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Ricavo Totale</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(r.total_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Costo Totale</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(r.total_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Margine</span>
                    <div className="flex items-center gap-1.5">
                      {marginPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      )}
                      <span className={cn(
                        'text-sm font-bold',
                        marginPositive ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        {formatCurrency(r.gross_margin)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">ROI</span>
                    <span className={cn(
                      'text-sm font-semibold',
                      r.roi >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {formatPercentage(r.roi)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Utile su Ricavi</span>
                    <span className={cn(
                      'text-sm font-semibold',
                      r.margin_on_revenue >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {formatPercentage(r.margin_on_revenue)}
                    </span>
                  </div>
                </div>

                {/* Delta from base */}
                <div className={cn(
                  'rounded-lg p-2.5 text-center',
                  deltaMargin > 0 ? 'bg-emerald-50' : deltaMargin < 0 ? 'bg-red-50' : 'bg-gray-50'
                )}>
                  <span className="text-xs text-gray-500">Δ Margine vs Base</span>
                  <p className={cn(
                    'text-sm font-bold',
                    deltaMargin > 0 ? 'text-emerald-600' : deltaMargin < 0 ? 'text-red-600' : 'text-gray-600'
                  )}>
                    {deltaMargin > 0 ? '+' : ''}{formatCurrency(deltaMargin)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Charts */}
      {scenarios.length >= 2 && (
        <>
          {/* Revenue / Cost / Margin Bar Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Confronto Economico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Legend />
                    {scenarios.map((s) => {
                      const color = SCENARIO_COLORS[s.type]?.bar || SCENARIO_COLORS.custom.bar;
                      return (
                        <Bar
                          key={s.id}
                          dataKey={s.name}
                          fill={color}
                          radius={[4, 4, 0, 0]}
                        />
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ROI & Margin on Revenue Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>ROI e Utile su Ricavi (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiChartData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <RechartsTooltip
                      formatter={(value) => formatPercentage(Number(value))}
                    />
                    <Legend />
                    <Bar dataKey="ROI" radius={[4, 4, 0, 0]}>
                      {roiChartData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={SCENARIO_COLORS[entry.type]?.bar || SCENARIO_COLORS.custom.bar}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="Utile su Ricavi" radius={[4, 4, 0, 0]}>
                      {roiChartData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={SCENARIO_COLORS[entry.type]?.bar || SCENARIO_COLORS.custom.bar}
                          opacity={0.6}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tabella Comparativa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Indicatore</th>
                      {scenarios.map((s) => (
                        <th key={s.id} className="text-right py-3 px-4 font-medium text-gray-600">
                          {s.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Variazione Prezzo Vendita', format: (s: ScenarioWithResults) => `${s.sale_price_variation > 0 ? '+' : ''}${s.sale_price_variation}%` },
                      { label: 'Variazione Costi Costruzione', format: (s: ScenarioWithResults) => `${s.construction_cost_variation > 0 ? '+' : ''}${s.construction_cost_variation}%` },
                      { label: 'Variazione Costi Acquisizione', format: (s: ScenarioWithResults) => `${s.acquisition_cost_variation > 0 ? '+' : ''}${s.acquisition_cost_variation}%` },
                      { label: 'Ricavo Totale', format: (s: ScenarioWithResults) => formatCurrency(s.computed_results.total_revenue) },
                      { label: 'Costo Totale', format: (s: ScenarioWithResults) => formatCurrency(s.computed_results.total_cost) },
                      { label: 'Margine', format: (s: ScenarioWithResults) => formatCurrency(s.computed_results.gross_margin), highlight: true },
                      { label: 'ROI', format: (s: ScenarioWithResults) => formatPercentage(s.computed_results.roi), highlight: true },
                      { label: 'Utile su Ricavi', format: (s: ScenarioWithResults) => formatPercentage(s.computed_results.margin_on_revenue) },
                      { label: 'Costo/mq', format: (s: ScenarioWithResults) => formatCurrency(s.computed_results.cost_per_sqm) },
                      { label: 'Ricavo/mq', format: (s: ScenarioWithResults) => formatCurrency(s.computed_results.revenue_per_sqm) },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className={cn(
                          'border-b border-gray-100',
                          row.highlight && 'bg-gray-50 font-semibold'
                        )}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">{row.label}</td>
                        {scenarios.map((s) => (
                          <td key={s.id} className="py-3 px-4 text-right text-gray-700">
                            {row.format(s)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
