'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, formatPercentage, formatNumber } from '@/lib/utils';
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
} from '@/types/database';
import {
  MapPin,
  Building2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  Rocket,
  Sliders,
  AlertTriangle,
  Shield,
  ArrowDown,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Strategy labels in Italian
const STRATEGY_LABELS: Record<string, string> = {
  ristrutturazione: 'Ristrutturazione e Rivendita',
  frazionamento: 'Frazionamento',
  nuova_costruzione: 'Nuova Costruzione',
  rivendita: 'Rivendita Diretta',
};

// Predefined scenario configs (fixed, not editable)
const PREDEFINED_SCENARIOS = [
  {
    key: 'conservative',
    name: 'Prudente',
    icon: ShieldAlert,
    color: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', bar: '#f59e0b' },
    sale_price_variation: -10,
    construction_cost_variation: 10,
    acquisition_cost_variation: 0,
    description: 'Prezzo vendita -10%, costi lavori +10%',
  },
  {
    key: 'realistic',
    name: 'Realistico',
    icon: Target,
    color: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800', bar: '#3b82f6' },
    sale_price_variation: 0,
    construction_cost_variation: 0,
    acquisition_cost_variation: 0,
    description: 'Valori base del piano',
  },
  {
    key: 'optimistic',
    name: 'Ottimistico',
    icon: Rocket,
    color: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', bar: '#10b981' },
    sale_price_variation: 10,
    construction_cost_variation: -5,
    acquisition_cost_variation: 0,
    description: 'Prezzo vendita +10%, costi lavori -5%',
  },
];

const CUSTOM_COLOR = { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800', bar: '#8b5cf6' };

interface RawData {
  units: PropertyUnit[];
  surfaces: UnitSurface[];
  acquisitionCosts: AcquisitionCost[];
  operationCosts: OperationCost[];
  constructionItems: ConstructionItem[];
  measurements: Measurement[];
}

export default function ScenariosPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [baseResults, setBaseResults] = useState<ProjectResults | null>(null);
  const [rawData, setRawData] = useState<RawData | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom simulation sliders
  const [customSaleVariation, setCustomSaleVariation] = useState(0);
  const [customConstructionVariation, setCustomConstructionVariation] = useState(0);
  const [customAcquisitionVariation, setCustomAcquisitionVariation] = useState(0);

  const applyVariations = useCallback((
    data: RawData,
    saleVar: number,
    constructionVar: number,
    acquisitionVar: number,
  ): ProjectResults => {
    const saleFactor = 1 + saleVar / 100;
    const constructionFactor = 1 + constructionVar / 100;
    const acquisitionFactor = 1 + acquisitionVar / 100;

    const adjustedUnits = data.units.map((u) => ({
      ...u,
      target_sale_price: Math.round(u.target_sale_price * saleFactor * 100) / 100,
      market_price_sqm: Math.round(u.market_price_sqm * saleFactor * 100) / 100,
    }));

    const adjustedItems = data.constructionItems.map((item) => ({
      ...item,
      unit_price: Math.round(item.unit_price * constructionFactor * 100) / 100,
    }));

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
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('property_units').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('unit_surfaces').select('*').order('sort_order'),
        supabase.from('acquisition_costs').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('operation_costs').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('construction_items').select('*').eq('project_id', projectId).order('sort_order'),
        supabase.from('measurements').select('*').order('sort_order'),
      ]);

      if (projectData) setProject(projectData as Project);

      const unitIds = (units || []).map((u: PropertyUnit) => u.id);
      const projectSurfaces = (surfaces || []).filter((s: UnitSurface) => unitIds.includes(s.unit_id));
      const itemIds = (constructionItems || []).map((i: ConstructionItem) => i.id);
      const projectMeasurements = (measurements || []).filter((m: Measurement) => itemIds.includes(m.item_id));

      const data: RawData = {
        units: (units || []) as PropertyUnit[],
        surfaces: projectSurfaces as UnitSurface[],
        acquisitionCosts: (acquisitionCosts || []) as AcquisitionCost[],
        operationCosts: (operationCosts || []) as OperationCost[],
        constructionItems: (constructionItems || []) as ConstructionItem[],
        measurements: projectMeasurements as Measurement[],
      };
      setRawData(data);

      const base = calculateProjectResults(
        data.units, data.surfaces, data.acquisitionCosts,
        data.operationCosts, data.constructionItems, data.measurements
      );
      setBaseResults(base);
      setLoading(false);
    }

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Compute predefined scenario results
  const predefinedResults = useMemo(() => {
    if (!rawData) return [];
    return PREDEFINED_SCENARIOS.map((scenario) => ({
      ...scenario,
      results: applyVariations(rawData, scenario.sale_price_variation, scenario.construction_cost_variation, scenario.acquisition_cost_variation),
    }));
  }, [rawData, applyVariations]);

  // Compute custom scenario results (reactive to slider changes)
  const customResults = useMemo(() => {
    if (!rawData) return null;
    return applyVariations(rawData, customSaleVariation, customConstructionVariation, customAcquisitionVariation);
  }, [rawData, customSaleVariation, customConstructionVariation, customAcquisitionVariation, applyVariations]);

  // Break-even calculation: find minimum sale price variation where margin >= 0
  const breakEvenAnalysis = useMemo(() => {
    if (!rawData || !baseResults) return null;

    // Binary search for break-even sale price variation
    let low = -100;
    let high = 0;

    // First check if base is already negative
    if (baseResults.gross_margin < 0) {
      high = 100;
    }

    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      const result = applyVariations(rawData, mid, 0, 0);
      if (result.gross_margin > 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    const breakEvenVariation = Math.round(high * 100) / 100;
    const breakEvenResult = applyVariations(rawData, breakEvenVariation, 0, 0);

    // Safety margin: how much can sale price drop before loss
    const safetyMarginPercent = baseResults.total_revenue > 0
      ? Math.round(Math.abs(breakEvenVariation) * 100) / 100
      : 0;

    // Break-even price (total revenue at break-even)
    const breakEvenRevenue = breakEvenResult.total_revenue;

    return {
      breakEvenVariation,
      breakEvenRevenue,
      safetyMarginPercent,
      totalCost: baseResults.total_cost,
    };
  }, [rawData, baseResults, applyVariations]);

  if (loading || !baseResults || !project) {
    return (
      <div className="p-4 md:p-8 max-w-7xl">
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

  // ============================================================
  // CHART DATA
  // ============================================================
  const allScenarios = [
    ...predefinedResults.map((s) => ({ name: s.name, results: s.results, color: s.color.bar, key: s.key })),
    ...(customResults ? [{ name: 'Personalizzato', results: customResults, color: CUSTOM_COLOR.bar, key: 'custom' }] : []),
  ];

  // Bar chart: margin comparison
  const marginChartData = allScenarios.map((s) => ({
    name: s.name,
    Margine: Math.round(s.results.gross_margin),
    fill: s.color,
  }));

  // Bar chart: ROI comparison
  const roiChartData = allScenarios.map((s) => ({
    name: s.name,
    ROI: Math.round(s.results.roi * 100) / 100,
    fill: s.color,
  }));

  // Radar chart data
  const radarData = [
    {
      metric: 'Margine',
      ...Object.fromEntries(allScenarios.map((s) => [s.name, Math.max(0, s.results.gross_margin)])),
    },
    {
      metric: 'ROI',
      ...Object.fromEntries(allScenarios.map((s) => [s.name, Math.max(0, s.results.roi * 1000)])),
    },
    {
      metric: 'Ricavo',
      ...Object.fromEntries(allScenarios.map((s) => [s.name, s.results.total_revenue])),
    },
    {
      metric: 'Efficienza Costi',
      ...Object.fromEntries(allScenarios.map((s) => {
        const efficiency = s.results.total_cost > 0 ? (s.results.total_revenue / s.results.total_cost) * 100000 : 0;
        return [s.name, Math.max(0, efficiency)];
      })),
    },
  ];

  const formatVariation = (v: number) => `${v > 0 ? '+' : ''}${v}%`;

  return (
    <div className="p-4 md:p-8 max-w-7xl space-y-8">

      {/* ============================================================ */}
      {/* SEZIONE 1: INTESTAZIONE OPERAZIONE                           */}
      {/* ============================================================ */}
      <div>
        <Card className="border-gray-300">
          <CardContent className="p-6">
            {/* Project Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  {project.location_city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {project.location_city}{project.location_province ? ` (${project.location_province})` : ''}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {STRATEGY_LABELS[project.strategy] || project.strategy}
                  </span>
                </div>
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Scenario Base
              </span>
            </div>

            {/* Base KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Ricavo Totale</p>
                <p className="text-xl font-bold text-blue-900 mt-1">{formatCurrency(baseResults.total_revenue)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Costo Totale</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(baseResults.total_cost)}</p>
              </div>
              <div className={cn('rounded-xl p-4', baseResults.gross_margin >= 0 ? 'bg-emerald-50' : 'bg-red-50')}>
                <p className={cn('text-xs font-medium uppercase tracking-wide', baseResults.gross_margin >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                  Margine
                </p>
                <p className={cn('text-xl font-bold mt-1', baseResults.gross_margin >= 0 ? 'text-emerald-900' : 'text-red-900')}>
                  {formatCurrency(baseResults.gross_margin)}
                </p>
              </div>
              <div className={cn('rounded-xl p-4', baseResults.roi >= 0 ? 'bg-emerald-50' : 'bg-red-50')}>
                <p className={cn('text-xs font-medium uppercase tracking-wide', baseResults.roi >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                  ROI
                </p>
                <p className={cn('text-xl font-bold mt-1', baseResults.roi >= 0 ? 'text-emerald-900' : 'text-red-900')}>
                  {formatPercentage(baseResults.roi)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* SEZIONE 2: SCENARI PREDEFINITI                                */}
      {/* ============================================================ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Scenari Predefiniti</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {predefinedResults.map((scenario) => {
            const Icon = scenario.icon;
            const r = scenario.results;
            const marginPositive = r.gross_margin >= 0;
            const deltaMargin = r.gross_margin - baseResults.gross_margin;

            return (
              <Card key={scenario.key} className={cn('border-2 overflow-hidden', scenario.color.border)}>
                {/* Header */}
                <div className={cn('px-5 py-4', scenario.color.bg)}>
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', scenario.color.badge)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                      <p className="text-xs text-gray-500">{scenario.description}</p>
                    </div>
                  </div>
                </div>

                {/* Variations applied */}
                <div className="px-5 py-3 border-b border-gray-100">
                  <div className="flex gap-3 text-xs">
                    {scenario.sale_price_variation !== 0 && (
                      <span className={cn('px-2 py-0.5 rounded-full font-medium',
                        scenario.sale_price_variation > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      )}>
                        Vendita {formatVariation(scenario.sale_price_variation)}
                      </span>
                    )}
                    {scenario.construction_cost_variation !== 0 && (
                      <span className={cn('px-2 py-0.5 rounded-full font-medium',
                        scenario.construction_cost_variation < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      )}>
                        Lavori {formatVariation(scenario.construction_cost_variation)}
                      </span>
                    )}
                    {scenario.sale_price_variation === 0 && scenario.construction_cost_variation === 0 && (
                      <span className="px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                        Nessuna variazione
                      </span>
                    )}
                  </div>
                </div>

                {/* Results */}
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Ricavo</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(r.total_revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Costo Totale</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(r.total_cost)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Margine</span>
                      <div className="flex items-center gap-1.5">
                        {marginPositive ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={cn('text-base font-bold', marginPositive ? 'text-emerald-600' : 'text-red-600')}>
                          {formatCurrency(r.gross_margin)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">ROI</span>
                    <span className={cn('text-base font-bold', r.roi >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                      {formatPercentage(r.roi)}
                    </span>
                  </div>

                  {/* Delta from base */}
                  {scenario.key !== 'realistic' && (
                    <div className={cn(
                      'rounded-lg p-3 text-center mt-2',
                      deltaMargin > 0 ? 'bg-emerald-50' : deltaMargin < 0 ? 'bg-red-50' : 'bg-gray-50'
                    )}>
                      <span className="text-xs text-gray-500 block">Differenza dal base</span>
                      <p className={cn(
                        'text-sm font-bold mt-0.5',
                        deltaMargin > 0 ? 'text-emerald-600' : deltaMargin < 0 ? 'text-red-600' : 'text-gray-600'
                      )}>
                        {deltaMargin > 0 ? '+' : ''}{formatCurrency(deltaMargin)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEZIONE 3: SIMULAZIONE PERSONALIZZATA                        */}
      {/* ============================================================ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-purple-600" />
          Simulazione Personalizzata
        </h2>
        <Card className={cn('border-2', CUSTOM_COLOR.border)}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Sliders */}
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  Modifica le variabili per simulare scenari personalizzati. I risultati si aggiornano in tempo reale.
                </p>

                {/* Sale Price Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Prezzo di Vendita</label>
                    <span className={cn(
                      'text-sm font-bold px-2 py-0.5 rounded',
                      customSaleVariation > 0 ? 'bg-emerald-100 text-emerald-700' :
                      customSaleVariation < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {formatVariation(customSaleVariation)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={customSaleVariation}
                    onChange={(e) => setCustomSaleVariation(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 bg-gray-200"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>-20%</span>
                    <span>0%</span>
                    <span>+20%</span>
                  </div>
                </div>

                {/* Construction Cost Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Costo Lavori</label>
                    <span className={cn(
                      'text-sm font-bold px-2 py-0.5 rounded',
                      customConstructionVariation < 0 ? 'bg-emerald-100 text-emerald-700' :
                      customConstructionVariation > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {formatVariation(customConstructionVariation)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={customConstructionVariation}
                    onChange={(e) => setCustomConstructionVariation(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 bg-gray-200"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>-20%</span>
                    <span>0%</span>
                    <span>+20%</span>
                  </div>
                </div>

                {/* Acquisition Cost Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Costo Acquisizione</label>
                    <span className={cn(
                      'text-sm font-bold px-2 py-0.5 rounded',
                      customAcquisitionVariation < 0 ? 'bg-emerald-100 text-emerald-700' :
                      customAcquisitionVariation > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {formatVariation(customAcquisitionVariation)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-10}
                    max={10}
                    step={1}
                    value={customAcquisitionVariation}
                    onChange={(e) => setCustomAcquisitionVariation(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 bg-gray-200"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>-10%</span>
                    <span>0%</span>
                    <span>+10%</span>
                  </div>
                </div>
              </div>

              {/* Right: Live Results */}
              {customResults && (
                <div className={cn('rounded-xl p-6', CUSTOM_COLOR.bg)}>
                  <div className="flex items-center gap-2 mb-5">
                    <Sliders className={cn('w-5 h-5', CUSTOM_COLOR.text)} />
                    <h3 className="font-semibold text-gray-900">Risultati Simulazione</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ricavo</span>
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(customResults.total_revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Costo Totale</span>
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(customResults.total_cost)}</span>
                    </div>

                    <div className="border-t border-purple-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Margine</span>
                        <div className="flex items-center gap-2">
                          {customResults.gross_margin >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          )}
                          <span className={cn(
                            'text-2xl font-bold',
                            customResults.gross_margin >= 0 ? 'text-emerald-600' : 'text-red-600'
                          )}>
                            {formatCurrency(customResults.gross_margin)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">ROI</span>
                      <span className={cn(
                        'text-2xl font-bold',
                        customResults.roi >= 0 ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        {formatPercentage(customResults.roi)}
                      </span>
                    </div>

                    {/* Delta from base */}
                    <div className={cn(
                      'rounded-lg p-3 text-center',
                      customResults.gross_margin - baseResults.gross_margin > 0 ? 'bg-emerald-100' :
                      customResults.gross_margin - baseResults.gross_margin < 0 ? 'bg-red-100' : 'bg-gray-100'
                    )}>
                      <span className="text-xs text-gray-500 block">Differenza dal piano base</span>
                      <p className={cn(
                        'text-sm font-bold mt-0.5',
                        customResults.gross_margin - baseResults.gross_margin > 0 ? 'text-emerald-700' :
                        customResults.gross_margin - baseResults.gross_margin < 0 ? 'text-red-700' : 'text-gray-700'
                      )}>
                        {customResults.gross_margin - baseResults.gross_margin > 0 ? '+' : ''}
                        {formatCurrency(customResults.gross_margin - baseResults.gross_margin)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* SEZIONE 4: GRAFICI COMPARATIVI                               */}
      {/* ============================================================ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Confronto Scenari</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Margin Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Margine per Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marginChartData} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Bar dataKey="Margine" radius={[6, 6, 0, 0]}>
                      {marginChartData.map((entry, idx) => (
                        <rect key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ROI Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">ROI per Scenario (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiChartData} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <RechartsTooltip
                      formatter={(value) => formatPercentage(Number(value))}
                    />
                    <Bar dataKey="ROI" radius={[6, 6, 0, 0]}>
                      {roiChartData.map((entry, idx) => (
                        <rect key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Confronto Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    {allScenarios.map((s) => (
                      <Radar
                        key={s.key}
                        name={s.name}
                        dataKey={s.name}
                        stroke={s.color}
                        fill={s.color}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEZIONE 5: INDICATORI DI ROBUSTEZZA                          */}
      {/* ============================================================ */}
      {breakEvenAnalysis && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            Indicatori di Robustezza
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Break-even Price */}
            <Card className="border-2 border-orange-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Break-even Price</h3>
                    <p className="text-xs text-gray-500">Ricavo minimo per non andare in perdita</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(breakEvenAnalysis.breakEvenRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Variazione prezzo vendita: {formatVariation(breakEvenAnalysis.breakEvenVariation)}
                </p>
              </CardContent>
            </Card>

            {/* Safety Margin */}
            <Card className="border-2 border-emerald-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Margine di Sicurezza</h3>
                    <p className="text-xs text-gray-500">Quanto il prezzo puo scendere</p>
                  </div>
                </div>
                <p className={cn(
                  'text-2xl font-bold',
                  breakEvenAnalysis.safetyMarginPercent > 10 ? 'text-emerald-700' :
                  breakEvenAnalysis.safetyMarginPercent > 5 ? 'text-amber-700' : 'text-red-700'
                )}>
                  {formatNumber(breakEvenAnalysis.safetyMarginPercent, 1)}%
                </p>
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        breakEvenAnalysis.safetyMarginPercent > 10 ? 'bg-emerald-500' :
                        breakEvenAnalysis.safetyMarginPercent > 5 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(breakEvenAnalysis.safetyMarginPercent * 5, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Rischioso</span>
                    <span>Sicuro</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Robustness Verdict */}
            <Card className={cn(
              'border-2',
              breakEvenAnalysis.safetyMarginPercent > 10 ? 'border-emerald-200' :
              breakEvenAnalysis.safetyMarginPercent > 5 ? 'border-amber-200' : 'border-red-200'
            )}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    breakEvenAnalysis.safetyMarginPercent > 10 ? 'bg-emerald-100' :
                    breakEvenAnalysis.safetyMarginPercent > 5 ? 'bg-amber-100' : 'bg-red-100'
                  )}>
                    <ArrowDown className={cn(
                      'w-5 h-5',
                      breakEvenAnalysis.safetyMarginPercent > 10 ? 'text-emerald-600' :
                      breakEvenAnalysis.safetyMarginPercent > 5 ? 'text-amber-600' : 'text-red-600'
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Valutazione Operazione</h3>
                    <p className="text-xs text-gray-500">Giudizio complessivo</p>
                  </div>
                </div>
                <p className={cn(
                  'text-lg font-bold',
                  breakEvenAnalysis.safetyMarginPercent > 10 ? 'text-emerald-700' :
                  breakEvenAnalysis.safetyMarginPercent > 5 ? 'text-amber-700' : 'text-red-700'
                )}>
                  {breakEvenAnalysis.safetyMarginPercent > 10
                    ? 'Operazione Solida'
                    : breakEvenAnalysis.safetyMarginPercent > 5
                    ? 'Operazione Accettabile'
                    : 'Operazione Rischiosa'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {breakEvenAnalysis.safetyMarginPercent > 10
                    ? "L'operazione resiste a un calo significativo del prezzo di vendita."
                    : breakEvenAnalysis.safetyMarginPercent > 5
                    ? 'Margine di sicurezza limitato. Valutare attentamente i rischi.'
                    : 'Il margine di sicurezza e troppo basso. Alto rischio di perdita.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary table */}
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tabella Riepilogativa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Indicatore</th>
                      {allScenarios.map((s) => (
                        <th key={s.key} className="text-right py-3 px-4 font-medium text-gray-600">
                          {s.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Ricavo Totale', format: (r: ProjectResults) => formatCurrency(r.total_revenue) },
                      { label: 'Costo Totale', format: (r: ProjectResults) => formatCurrency(r.total_cost) },
                      { label: 'Margine', format: (r: ProjectResults) => formatCurrency(r.gross_margin), highlight: true },
                      { label: 'ROI', format: (r: ProjectResults) => formatPercentage(r.roi), highlight: true },
                      { label: 'Utile su Ricavi', format: (r: ProjectResults) => formatPercentage(r.margin_on_revenue) },
                      { label: 'Costo/mq', format: (r: ProjectResults) => formatCurrency(r.cost_per_sqm) },
                      { label: 'Ricavo/mq', format: (r: ProjectResults) => formatCurrency(r.revenue_per_sqm) },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className={cn(
                          'border-b border-gray-100',
                          row.highlight && 'bg-gray-50 font-semibold'
                        )}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">{row.label}</td>
                        {allScenarios.map((s) => (
                          <td key={s.key} className="py-3 px-4 text-right text-gray-700">
                            {row.format(s.results)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
