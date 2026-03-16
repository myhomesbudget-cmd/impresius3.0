'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { calculateProjectResults } from '@/lib/calculations';
import { OPERATION_SECTIONS, FLOORS } from '@/types/database';
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
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
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

      if (projectData) {
        setProject(projectData as Project);
      }

      // Filter surfaces to only include those belonging to project units
      const unitIds = (units || []).map((u: PropertyUnit) => u.id);
      const projectSurfaces = (surfaces || []).filter((s: UnitSurface) =>
        unitIds.includes(s.unit_id)
      );

      // Filter measurements to only include those belonging to project construction items
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

      setResults(calculated);
      setLoading(false);
    }

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (loading || !results) {
    return (
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
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

  const marginBgColor =
    results.margin_percentage > 15
      ? 'bg-emerald-50 border-emerald-200'
      : results.margin_percentage >= 5
        ? 'bg-amber-50 border-amber-200'
        : 'bg-red-50 border-red-200';

  const getFloorLabel = (floorValue: string) => {
    const floor = FLOORS.find((f) => f.value === floorValue);
    return floor ? floor.label : floorValue;
  };

  const getSectionLabel = (sectionValue: string) => {
    const section = OPERATION_SECTIONS.find((s) => s.value === sectionValue);
    return section ? section.label : sectionValue;
  };

  // Chart data for cost composition donut
  const chartData = [
    { name: 'Acquisizione', value: results.total_acquisition_cost, color: '#3b82f6' },
    { name: 'Costi Operativi', value: results.total_operation_cost, color: '#f59e0b' },
    { name: 'Lavori', value: results.total_construction_cost, color: '#10b981' },
    ...(results.gross_margin > 0
      ? [{ name: 'Margine', value: results.gross_margin, color: '#22c55e' }]
      : []),
  ];

  // Operation cost section labels for the cost summary
  const sectionLabels: Record<string, string> = {
    management: 'Costi Gestione/Marketing',
    utilities: 'Utenze e Allacciamenti',
    professionals: 'Professionisti',
    permits: 'Titoli Edilizi',
  };

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Sintesi dell&apos;Operazione
        </h1>
        {project && (
          <p className="mt-1 text-sm text-gray-500">{project.name}</p>
        )}
      </div>

      {/* Section 1: Indicatori Principali */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Indicatori Principali
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Margine Lordo */}
          <Card className={cn('border', marginBgColor)}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Margine Lordo
                </span>
                {results.gross_margin >= 0 ? (
                  <TrendingUp className={cn('w-5 h-5', marginColor)} />
                ) : (
                  <TrendingDown className={cn('w-5 h-5', marginColor)} />
                )}
              </div>
              <p className={cn('text-2xl font-bold', marginColor)}>
                {formatCurrency(results.gross_margin)}
              </p>
              <p className={cn('text-sm mt-1', marginColor)}>
                {formatPercentage(results.margin_percentage)} su costo
              </p>
            </CardContent>
          </Card>

          {/* ROI */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">ROI</span>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(results.roi)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Return on Investment
              </p>
            </CardContent>
          </Card>

          {/* Costo Totale */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Costo Totale
                </span>
                <DollarSign className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(results.total_cost)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(results.cost_per_sqm)}/mq
              </p>
            </CardContent>
          </Card>

          {/* Ricavo Totale */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Ricavo Totale
                </span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(results.total_revenue)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(results.revenue_per_sqm)}/mq
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Riepilogo Ricavi */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo Ricavi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Nome
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Piano
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Sup. Ragguagliata
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Valore Calcolato
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Prezzo Stabilito
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.units_summary.map((unit, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {unit.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {getFloorLabel(unit.floor)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatNumber(unit.adjusted_surface)} mq
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(unit.calculated_value)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(unit.target_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td
                      colSpan={2}
                      className="py-3 px-4 font-semibold text-gray-900"
                    >
                      TOTALE
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatNumber(
                        results.units_summary.reduce(
                          (sum, u) => sum + u.adjusted_surface,
                          0
                        )
                      )}{' '}
                      mq
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(
                        results.units_summary.reduce(
                          (sum, u) => sum + u.calculated_value,
                          0
                        )
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
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
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo Costi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Voce di Costo
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Importo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Acquisizione */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      Acquisizione Immobile
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {formatCurrency(results.total_acquisition_cost)}
                    </td>
                  </tr>

                  {/* Operation costs by section */}
                  {results.operation_cost_by_section.map((section) => (
                    <tr
                      key={section.section}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {sectionLabels[section.section] ||
                          getSectionLabel(section.section)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(section.total)}
                      </td>
                    </tr>
                  ))}

                  {/* Construction costs by floor */}
                  {results.construction_by_floor.map((floor) => (
                    <tr
                      key={floor.floor}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        Lavori - {getFloorLabel(floor.floor)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(floor.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      TOTALE COSTI
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
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
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Analisi Margine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Donut Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Key Metrics */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Margine Lordo
                  </span>
                  <span className={cn('font-semibold', marginColor)}>
                    {formatCurrency(results.gross_margin)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Margine su Costo
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatPercentage(results.margin_percentage)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Margine su Ricavo
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatPercentage(results.margin_on_revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Costo per mq</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.cost_per_sqm)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Ricavo per mq</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.revenue_per_sqm)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Incidenza Costi */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Incidenza Costi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Acquisizione */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Acquisizione
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPercentage(results.acquisition_incidence)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(results.acquisition_incidence, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Operativi */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Operativi
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPercentage(results.operation_incidence)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(results.operation_incidence, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Costruzione */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Costruzione
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPercentage(results.construction_incidence)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
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
