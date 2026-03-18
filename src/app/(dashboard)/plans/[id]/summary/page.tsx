'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { calculateProjectResults } from '@/lib/calculations';
import { loadProjectDataset } from '@/repositories/project-data';
import { OPERATION_SECTIONS, FLOORS } from '@/types/database';
import type {
  Project,
  ProjectResults,
} from '@/types/database';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Ruler,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

export default function SummaryPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [results, setResults] = useState<ProjectResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);

      const [{ data: projectData }, dataset] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        loadProjectDataset(supabase, projectId),
      ]);

      if (projectData) {
        setProject(projectData as Project);
      }

      const calculated = calculateProjectResults(
        dataset.units,
        dataset.surfaces,
        dataset.acquisitionCosts,
        dataset.operationCosts,
        dataset.constructionItems,
        dataset.measurements,
      );

      setResults(calculated);
      setLoading(false);
    }

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (loading || !results) {
    return (
      <div className="p-4 md:p-8 max-w-6xl">
        <div className="mb-10">
          <div className="h-9 w-72 rounded-lg animate-shimmer" />
          <div className="h-5 w-48 rounded-lg animate-shimmer mt-3" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl animate-shimmer" />
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-52 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const marginColor =
    results.margin_percentage > 15
      ? 'text-emerald-600'
      : results.margin_percentage >= 5
        ? 'text-amber-600'
        : 'text-red-600';

  const marginBg =
    results.margin_percentage > 15
      ? 'kpi-card-emerald'
      : results.margin_percentage >= 5
        ? 'kpi-card-amber'
        : 'kpi-card-red';

  const marginIconBg =
    results.margin_percentage > 15
      ? 'bg-emerald-50'
      : results.margin_percentage >= 5
        ? 'bg-amber-50'
        : 'bg-red-50';

  const getFloorLabel = (floorValue: string) => {
    const floor = FLOORS.find((f) => f.value === floorValue);
    return floor ? floor.label : floorValue;
  };

  const getSectionLabel = (sectionValue: string) => {
    const section = OPERATION_SECTIONS.find((s) => s.value === sectionValue);
    return section ? section.label : sectionValue;
  };

  const chartData = [
    { name: 'Acquisizione', value: results.total_acquisition_cost, color: '#3b82f6' },
    { name: 'Costi Operativi', value: results.total_operation_cost, color: '#f59e0b' },
    { name: 'Lavori', value: results.total_construction_cost, color: '#10b981' },
    ...(results.gross_margin > 0
      ? [{ name: 'Margine', value: results.gross_margin, color: '#22c55e' }]
      : []),
  ];

  const sectionLabels: Record<string, string> = {
    management: 'Costi Gestione/Marketing',
    utilities: 'Utenze e Allacciamenti',
    professionals: 'Professionisti',
    permits: 'Titoli Edilizi',
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="page-header-title">
          Sintesi dell&apos;Operazione
        </h1>
        {project && (
          <p className="page-header-subtitle">{project.name}</p>
        )}
      </div>

      {/* Section 1: Indicatori Principali */}
      <div className="mb-10">
        <div className="section-header">
          <div className="icon-container icon-container-sm rounded-lg bg-slate-100">
            <Target className="w-4 h-4 text-slate-600" />
          </div>
          <h2 className="section-header-title">Indicatori Principali</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Margine Lordo */}
          <div className={cn('kpi-card', marginBg)}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="metric-label">Margine Lordo</span>
                <div className={cn("icon-container icon-container-md rounded-xl", marginIconBg)}>
                  {results.gross_margin >= 0 ? (
                    <TrendingUp className={cn('w-5 h-5', marginColor)} />
                  ) : (
                    <TrendingDown className={cn('w-5 h-5', marginColor)} />
                  )}
                </div>
              </div>
              <p className={cn('metric-value', marginColor)}>
                {formatCurrency(results.gross_margin)}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                {results.gross_margin >= 0 ? (
                  <ArrowUpRight className={cn('w-4 h-4', marginColor)} />
                ) : (
                  <ArrowDownRight className={cn('w-4 h-4', marginColor)} />
                )}
                <span className={cn('text-sm font-semibold', marginColor)}>
                  {formatPercentage(results.margin_percentage)} su costo
                </span>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="kpi-card kpi-card-blue">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="metric-label">ROI</span>
                <div className="icon-container icon-container-md rounded-xl bg-blue-50">
                  <Percent className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="metric-value text-blue-700">
                {formatPercentage(results.roi)}
              </p>
              <p className="metric-sublabel mt-2">
                Return on Investment
              </p>
            </div>
          </div>

          {/* Costo Totale */}
          <div className="kpi-card kpi-card-red">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="metric-label">Costo Totale</span>
                <div className="icon-container icon-container-md rounded-xl bg-red-50">
                  <DollarSign className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <p className="metric-value text-slate-900">
                {formatCurrency(results.total_cost)}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Ruler className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-medium text-slate-500">
                  {formatCurrency(results.cost_per_sqm)}/mq
                </span>
              </div>
            </div>
          </div>

          {/* Ricavo Totale */}
          <div className="kpi-card kpi-card-emerald">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="metric-label">Ricavo Totale</span>
                <div className="icon-container icon-container-md rounded-xl bg-emerald-50">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <p className="metric-value text-slate-900">
                {formatCurrency(results.total_revenue)}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Ruler className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-medium text-slate-500">
                  {formatCurrency(results.revenue_per_sqm)}/mq
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Riepilogo Ricavi */}
      <div className="mb-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-emerald-50">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <CardTitle>Riepilogo Ricavi</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mobile-scroll-hint -mx-6">
              <table className="w-full table-premium">
                <thead>
                  <tr>
                    <th className="text-left">Nome</th>
                    <th className="text-left">Piano</th>
                    <th className="text-right">Sup. Ragguagliata</th>
                    <th className="text-right">Valore Calcolato</th>
                    <th className="text-right">Prezzo Stabilito</th>
                  </tr>
                </thead>
                <tbody>
                  {results.units_summary.map((unit, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold text-slate-900">
                        {unit.name}
                      </td>
                      <td className="text-slate-600">
                        {getFloorLabel(unit.floor)}
                      </td>
                      <td className="text-right text-slate-700 font-medium">
                        {formatNumber(unit.adjusted_surface)} mq
                      </td>
                      <td className="text-right text-slate-700">
                        {formatCurrency(unit.calculated_value)}
                      </td>
                      <td className="text-right font-bold text-slate-900">
                        {formatCurrency(unit.target_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="font-bold text-slate-900">
                      TOTALE
                    </td>
                    <td className="text-right font-bold text-slate-900">
                      {formatNumber(
                        results.units_summary.reduce(
                          (sum, u) => sum + u.adjusted_surface,
                          0
                        )
                      )}{' '}
                      mq
                    </td>
                    <td className="text-right font-bold text-slate-900">
                      {formatCurrency(
                        results.units_summary.reduce(
                          (sum, u) => sum + u.calculated_value,
                          0
                        )
                      )}
                    </td>
                    <td className="text-right font-extrabold text-emerald-700 text-lg">
                      {formatCurrency(results.total_revenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Riepilogo Costi */}
      <div className="mb-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-red-50">
                <DollarSign className="w-4 h-4 text-red-500" />
              </div>
              <CardTitle>Riepilogo Costi</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mobile-scroll-hint -mx-6">
              <table className="w-full table-premium">
                <thead>
                  <tr>
                    <th className="text-left">Voce di Costo</th>
                    <th className="text-right">Importo</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Acquisizione */}
                  <tr>
                    <td className="font-semibold text-slate-900">
                      Acquisizione Immobile
                    </td>
                    <td className="text-right font-medium text-slate-700">
                      {formatCurrency(results.total_acquisition_cost)}
                    </td>
                  </tr>

                  {/* Operation costs by section */}
                  {results.operation_cost_by_section.map((section) => (
                    <tr key={section.section}>
                      <td className="font-semibold text-slate-900">
                        {sectionLabels[section.section] ||
                          getSectionLabel(section.section)}
                      </td>
                      <td className="text-right font-medium text-slate-700">
                        {formatCurrency(section.total)}
                      </td>
                    </tr>
                  ))}

                  {/* Construction costs by floor */}
                  {results.construction_by_floor.map((floor) => (
                    <tr key={floor.floor}>
                      <td className="font-semibold text-slate-900">
                        Lavori - {getFloorLabel(floor.floor)}
                      </td>
                      <td className="text-right font-medium text-slate-700">
                        {formatCurrency(floor.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="font-bold text-slate-900">
                      TOTALE COSTI
                    </td>
                    <td className="text-right font-extrabold text-red-700 text-lg">
                      {formatCurrency(results.total_cost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Analisi Margine */}
      <div className="mb-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-indigo-50">
                <PieChart className="w-4 h-4 text-indigo-600" />
              </div>
              <CardTitle>Analisi Margine</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Donut Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={115}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
                        padding: '8px 12px',
                        fontSize: '13px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Key Metrics */}
              <div className="flex flex-col justify-center space-y-1">
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={cn("icon-container icon-container-sm rounded-lg", marginIconBg)}>
                      <TrendingUp className={cn("w-3.5 h-3.5", marginColor)} />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Margine Lordo</span>
                  </div>
                  <span className={cn('font-bold text-lg', marginColor)}>
                    {formatCurrency(results.gross_margin)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="icon-container icon-container-sm rounded-lg bg-slate-100">
                      <Percent className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Margine su Costo</span>
                  </div>
                  <span className="font-bold text-lg text-slate-900">
                    {formatPercentage(results.margin_percentage)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="icon-container icon-container-sm rounded-lg bg-slate-100">
                      <Percent className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Margine su Ricavo</span>
                  </div>
                  <span className="font-bold text-lg text-slate-900">
                    {formatPercentage(results.margin_on_revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="icon-container icon-container-sm rounded-lg bg-red-50">
                      <Ruler className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Costo per mq</span>
                  </div>
                  <span className="font-bold text-lg text-slate-900">
                    {formatCurrency(results.cost_per_sqm)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="icon-container icon-container-sm rounded-lg bg-emerald-50">
                      <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">Ricavo per mq</span>
                  </div>
                  <span className="font-bold text-lg text-slate-900">
                    {formatCurrency(results.revenue_per_sqm)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Incidenza Costi */}
      <div className="mb-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="icon-container icon-container-sm rounded-lg bg-blue-50">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle>Incidenza Costi</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Acquisizione */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      Acquisizione
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">
                      {formatCurrency(results.total_acquisition_cost)}
                    </span>
                    <span className="text-sm font-bold text-slate-900 min-w-[3.5rem] text-right">
                      {formatPercentage(results.acquisition_incidence)}
                    </span>
                  </div>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill bg-gradient-to-r from-blue-500 to-blue-400"
                    style={{
                      width: `${Math.min(results.acquisition_incidence, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Operativi */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      Operativi
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">
                      {formatCurrency(results.total_operation_cost)}
                    </span>
                    <span className="text-sm font-bold text-slate-900 min-w-[3.5rem] text-right">
                      {formatPercentage(results.operation_incidence)}
                    </span>
                  </div>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill bg-gradient-to-r from-amber-500 to-amber-400"
                    style={{
                      width: `${Math.min(results.operation_incidence, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Costruzione */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      Costruzione
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">
                      {formatCurrency(results.total_construction_cost)}
                    </span>
                    <span className="text-sm font-bold text-slate-900 min-w-[3.5rem] text-right">
                      {formatPercentage(results.construction_incidence)}
                    </span>
                  </div>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{
                      width: `${Math.min(results.construction_incidence, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
