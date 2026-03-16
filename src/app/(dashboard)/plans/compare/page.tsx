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

  // Fetch all user projects
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

    // Fetch all data in parallel for all selected projects
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

  // Compute best value per indicator for highlighting
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
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Confronta Operazioni</h1>
          <p className="mt-1 text-sm text-gray-500">
            Seleziona almeno 2 operazioni da confrontare
          </p>
        </div>

        {loadingProjects ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : projects.length < 2 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                Servono almeno 2 operazioni per il confronto
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Crea altre operazioni per poterle confrontare
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {projects.map((project) => {
                    const isSelected = selected.has(project.id);
                    return (
                      <button
                        key={project.id}
                        onClick={() => toggleProject(project.id)}
                        className={cn(
                          'w-full flex items-center gap-4 px-5 py-4 text-left transition-colors',
                          isSelected
                            ? 'bg-blue-50 hover:bg-blue-100'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {project.location_city
                              ? `${project.location_city}${project.location_province ? ` (${project.location_province})` : ''}`
                              : 'Localita non specificata'}
                            {' — '}
                            {getStrategyLabel(project.strategy)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            project.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : project.status === 'draft'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
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
              >
                <GitCompareArrows className="w-4 h-4 mr-2" />
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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Confronto Operazioni</h1>
          <p className="mt-1 text-sm text-gray-500">
            {compared.length} operazioni a confronto
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setPhase('select')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Modifica selezione
        </Button>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-5 font-medium text-gray-600 sticky left-0 bg-white min-w-[180px]">
                    Indicatore
                  </th>
                  {compared.map((c) => (
                    <th
                      key={c.project.id}
                      className="text-right py-4 px-5 font-semibold text-gray-900 min-w-[160px]"
                    >
                      <div className="truncate max-w-[200px] ml-auto">{c.project.name}</div>
                      {c.project.location_city && (
                        <div className="text-xs font-normal text-gray-500 mt-0.5 truncate">
                          {c.project.location_city}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INDICATORS.map((ind) => (
                  <tr
                    key={ind.key}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3.5 px-5 font-medium text-gray-700 sticky left-0 bg-white">
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
                            'py-3.5 px-5 text-right font-semibold tabular-nums',
                            isBest
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-gray-900'
                          )}
                        >
                          {formatValue(ind.key, value)}
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
          <CardTitle className="text-base">Composizione Costi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-5 font-medium text-gray-600 sticky left-0 bg-white min-w-[180px]">
                    Voce
                  </th>
                  {compared.map((c) => (
                    <th
                      key={c.project.id}
                      className="text-right py-3 px-5 font-semibold text-gray-900 min-w-[160px]"
                    >
                      <span className="truncate block max-w-[200px] ml-auto">
                        {c.project.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-5 font-medium text-gray-700 sticky left-0 bg-white">
                    Acquisizione
                  </td>
                  {compared.map((c) => (
                    <td key={c.project.id} className="py-3 px-5 text-right text-gray-700 tabular-nums">
                      {formatCurrency(c.results.total_acquisition_cost)}
                      <span className="block text-xs text-gray-400">
                        {formatPercentage(c.results.acquisition_incidence)}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-5 font-medium text-gray-700 sticky left-0 bg-white">
                    Costi Operativi
                  </td>
                  {compared.map((c) => (
                    <td key={c.project.id} className="py-3 px-5 text-right text-gray-700 tabular-nums">
                      {formatCurrency(c.results.total_operation_cost)}
                      <span className="block text-xs text-gray-400">
                        {formatPercentage(c.results.operation_incidence)}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-5 font-medium text-gray-700 sticky left-0 bg-white">
                    Costruzione / Lavori
                  </td>
                  {compared.map((c) => (
                    <td key={c.project.id} className="py-3 px-5 text-right text-gray-700 tabular-nums">
                      {formatCurrency(c.results.total_construction_cost)}
                      <span className="block text-xs text-gray-400">
                        {formatPercentage(c.results.construction_incidence)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-3 px-5 font-semibold text-gray-900 sticky left-0 bg-gray-50">
                    Totale
                  </td>
                  {compared.map((c) => (
                    <td key={c.project.id} className="py-3 px-5 text-right font-semibold text-gray-900 tabular-nums">
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
