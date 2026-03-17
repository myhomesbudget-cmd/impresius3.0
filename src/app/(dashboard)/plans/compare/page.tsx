'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { calculateProjectResults } from '@/lib/calculations';
import { STRATEGIES } from '@/types/database';
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
  ArrowLeft,
  BarChart3,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
  GitCompareArrows,
  Trophy,
} from 'lucide-react';

interface ProjectWithResults {
  project: Project;
  results: ProjectResults;
}

const INDICATORS = [
  { key: 'total_revenue', label: 'Ricavo Totale', format: 'currency', best: 'max' },
  { key: 'total_cost', label: 'Costo Totale', format: 'currency', best: 'min' },
  { key: 'gross_margin', label: 'Margine Lordo', format: 'currency', best: 'max' },
  { key: 'roi', label: 'ROI', format: 'percent', best: 'max' },
  { key: 'margin_percentage', label: 'Margine su Costo', format: 'percent', best: 'max' },
  { key: 'margin_on_revenue', label: 'Margine su Ricavo', format: 'percent', best: 'max' },
  { key: 'cost_per_sqm', label: 'Costo per mq', format: 'currency', best: 'min' },
  { key: 'revenue_per_sqm', label: 'Ricavo per mq', format: 'currency', best: 'max' },
] as const;

type IndicatorKey = (typeof INDICATORS)[number]['key'];

function getStrategyLabel(value: string) {
  return STRATEGIES.find((s) => s.value === value)?.label ?? value;
}

export default function ComparePage() {
  const supabase = createClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compared, setCompared] = useState<ProjectWithResults[]>([]);
  const [phase, setPhase] = useState<'select' | 'compare'>('select');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      setProjects((data || []) as Project[]);
      setLoadingProjects(false);
    }

    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleProject = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCompare = async () => {
    if (selected.size < 2) return;
    setLoadingResults(true);

    const ids = Array.from(selected);
    const results: ProjectWithResults[] = [];

    for (const projectId of ids) {
      const [
        { data: units },
        { data: surfaces },
        { data: acquisitionCosts },
        { data: operationCosts },
        { data: constructionItems },
        { data: measurements },
      ] = await Promise.all([
        supabase
          .from('property_units')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order'),
        supabase.from('unit_surfaces').select('*').order('sort_order'),
        supabase
          .from('acquisition_costs')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order'),
        supabase
          .from('operation_costs')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order'),
        supabase
          .from('construction_items')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order'),
        supabase.from('measurements').select('*').order('sort_order'),
      ]);

      const unitIds = (units || []).map((u: PropertyUnit) => u.id);
      const projectSurfaces = (surfaces || []).filter((s: UnitSurface) =>
        unitIds.includes(s.unit_id)
      );
      const itemIds = (constructionItems || []).map((i: ConstructionItem) => i.id);
      const projectMeasurements = (measurements || []).filter((m: Measurement) =>
        itemIds.includes(m.item_id)
      );

      const calculated = calculateProjectResults(
        (units || []) as PropertyUnit[],
        projectSurfaces as UnitSurface[],
        (acquisitionCosts || []) as AcquisitionCost[],
        (operationCosts || []) as OperationCost[],
        (constructionItems || []) as ConstructionItem[],
        projectMeasurements as Measurement[]
      );

      const project = projects.find((p) => p.id === projectId)!;
      results.push({ project, results: calculated });
    }

    setCompared(results);
    setPhase('compare');
    setLoadingResults(false);
  };

  const bestValues = useMemo(() => {
    if (compared.length === 0) return {};

    const bests: Partial<Record<IndicatorKey, number>> = {};

    for (const ind of INDICATORS) {
      const values = compared.map((c) => c.results[ind.key]);
      bests[ind.key] =
        ind.best === 'max' ? Math.max(...values) : Math.min(...values);
    }

    return bests;
  }, [compared]);

  const formatValue = (key: IndicatorKey, value: number) => {
    const ind = INDICATORS.find((i) => i.key === key)!;
    if (ind.format === 'currency') return formatCurrency(value);
    return formatPercentage(value);
  };

  // --- PHASE: SELECT ---
  if (phase === 'select') {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="page-header-title">Confronta Operazioni</h1>
          <p className="page-header-subtitle">
            Seleziona almeno 2 operazioni da confrontare
          </p>
        </div>

        {loadingProjects ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : projects.length < 2 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 hover:shadow-none">
            <CardContent className="py-16 text-center">
              <div className="empty-state-icon mx-auto">
                <AlertCircle className="w-9 h-9 text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold">
                Servono almeno 2 operazioni per il confronto
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Crea altre operazioni per poterle confrontare
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {projects.map((project) => {
                    const isSelected = selected.has(project.id);
                    return (
                      <button
                        key={project.id}
                        onClick={() => toggleProject(project.id)}
                        className={cn(
                          'w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-150',
                          isSelected
                            ? 'bg-blue-50/80 hover:bg-blue-50'
                            : 'hover:bg-slate-50'
                        )}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-semibold truncate",
                            isSelected ? "text-blue-900" : "text-slate-900"
                          )}>
                            {project.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {project.location_city
                              ? `${project.location_city}${project.location_province ? ` (${project.location_province})` : ''}`
                              : 'Localita non specificata'}
                            {' — '}
                            {getStrategyLabel(project.strategy)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'badge-premium',
                            project.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : project.status === 'draft'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                          )}
                        >
                          {project.status === 'active'
                            ? 'Attivo'
                            : project.status === 'draft'
                              ? 'Bozza'
                              : 'Archiviato'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                variant="gradient"
                size="lg"
                onClick={handleCompare}
                disabled={selected.size < 2}
                loading={loadingResults}
                className="gap-2"
              >
                <GitCompareArrows className="w-4 h-4" />
                Confronta ({selected.size})
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- PHASE: COMPARE ---
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header-title">Confronto Operazioni</h1>
          <p className="page-header-subtitle">
            {compared.length} operazioni a confronto
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setPhase('select')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Modifica selezione
        </Button>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="icon-container icon-container-sm rounded-lg bg-blue-50">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle>Indicatori a Confronto</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th className="text-left sticky left-0 bg-slate-50 min-w-[180px] z-10">
                    Indicatore
                  </th>
                  {compared.map((c) => (
                    <th
                      key={c.project.id}
                      className="text-right min-w-[160px]"
                    >
                      <div className="truncate max-w-[200px] ml-auto font-bold">{c.project.name}</div>
                      {c.project.location_city && (
                        <div className="text-[0.6875rem] font-normal text-slate-500 mt-0.5 truncate">
                          {c.project.location_city}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INDICATORS.map((ind) => (
                  <tr key={ind.key}>
                    <td className="font-semibold text-slate-700 sticky left-0 bg-white z-10">
                      {ind.label}
                    </td>
                    {compared.map((c) => {
                      const value = c.results[ind.key];
                      const isBest =
                        compared.length > 1 && value === bestValues[ind.key];

                      return (
                        <td
                          key={c.project.id}
                          className={cn(
                            'text-right font-bold tabular-nums',
                            isBest
                              ? 'text-emerald-700 bg-emerald-50/60'
                              : 'text-slate-900'
                          )}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {isBest && <Trophy className="w-3.5 h-3.5 text-emerald-500" />}
                            {formatValue(ind.key, value)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cost breakdown comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="icon-container icon-container-sm rounded-lg bg-indigo-50">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
            </div>
            <CardTitle>Composizione Costi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th className="text-left sticky left-0 bg-slate-50 min-w-[180px] z-10">
                    Voce
                  </th>
                  {compared.map((c) => (
                    <th
                      key={c.project.id}
                      className="text-right min-w-[160px]"
                    >
                      <span className="truncate block max-w-[200px] ml-auto font-bold">
                        {c.project.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold text-slate-700 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Acquisizione
                    </div>
                  </td>
                  {compared.map((c) => (
                    <td key={c.project.id} className="text-right tabular-nums">
                      <span className="font-semibold text-slate-900">{formatCurrency(c.results.total_acquisition_cost)}</span>
                      <span className="block text-xs font-medium text-slate-400 mt-0.5">
                        {formatPercentage(c.results.acquisition_incidence)}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="font-semibold text-slate-700 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Costi Operativi
                    </div>
                  </td>
                  {compared.map((c) => (
                    <td key={c.project.id} className="text-right tabular-nums">
                      <span className="font-semibold text-slate-900">{formatCurrency(c.results.total_operation_cost)}</span>
                      <span className="block text-xs font-medium text-slate-400 mt-0.5">
                        {formatPercentage(c.results.operation_incidence)}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="font-semibold text-slate-700 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Costruzione / Lavori
                    </div>
                  </td>
                  {compared.map((c) => (
                    <td key={c.project.id} className="text-right tabular-nums">
                      <span className="font-semibold text-slate-900">{formatCurrency(c.results.total_construction_cost)}</span>
                      <span className="block text-xs font-medium text-slate-400 mt-0.5">
                        {formatPercentage(c.results.construction_incidence)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="font-bold text-slate-900 sticky left-0 z-10">
                    Totale
                  </td>
                  {compared.map((c) => (
                    <td key={c.project.id} className="text-right font-extrabold text-slate-900 tabular-nums text-base">
                      {formatCurrency(c.results.total_cost)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
