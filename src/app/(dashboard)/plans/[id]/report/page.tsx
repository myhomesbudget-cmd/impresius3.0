'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import {
  calculateProjectResults,
  calculateAcquisitionAmount,
  calculateOperationAmount,
  calculateItemTotal,
  calculateItemQuantity,
} from '@/lib/calculations';
import { loadProjectDataset } from '@/repositories/project-data';
import { FLOORS, OPERATION_SECTIONS, CONSTRUCTION_CATEGORIES } from '@/types/database';
import type {
  Project,
  ProjectResults,
  AcquisitionCost,
  OperationCost,
  ConstructionItem,
  Measurement,
} from '@/types/database';
import { Printer, Loader2, FileText, MapPin, Calendar, Target, Building2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const STRATEGY_LABELS: Record<string, string> = {
  ristrutturazione: 'Ristrutturazione',
  frazionamento: 'Frazionamento',
  nuova_costruzione: 'Nuova Costruzione',
  rivendita: 'Rivendita',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  residenziale: 'Residenziale',
  commerciale: 'Commerciale',
  misto: 'Misto',
};

const SECTION_LABELS: Record<string, string> = {
  management: 'Costi Fissi di Gestione - Vendite - Marketing',
  utilities: 'Costi di Utenze ed Allacciamenti',
  professionals: 'Costi Professionisti',
  permits: 'Costi e Spese Titoli Edilizi',
};

const CHART_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];
const COST_BREAKDOWN_COLORS = ['#2563eb', '#f59e0b', '#10b981'];

const getFloorLabel = (value: string) => {
  const floor = FLOORS.find((f) => f.value === value);
  return floor ? floor.label : value;
};

const getCategoryLabel = (value: string) => {
  const cat = CONSTRUCTION_CATEGORIES.find((c) => c.value === value);
  return cat ? cat.label : value;
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function ReportPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [results, setResults] = useState<ProjectResults | null>(null);
  const [acquisitionCosts, setAcquisitionCosts] = useState<AcquisitionCost[]>([]);
  const [operationCosts, setOperationCosts] = useState<OperationCost[]>([]);
  const [constructionItems, setConstructionItems] = useState<ConstructionItem[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);

      const [{ data: projectData }, dataset] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        loadProjectDataset(supabase, projectId),
      ]);

      if (projectData) setProject(projectData as Project);

      setAcquisitionCosts(dataset.acquisitionCosts);
      setOperationCosts(dataset.operationCosts);
      setConstructionItems(dataset.constructionItems);
      setMeasurements(dataset.measurements);

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

  if (loading || !results || !project) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Caricamento report...</p>
        </div>
      </div>
    );
  }

  // Build maps
  const measurementsByItem = new Map<string, Measurement[]>();
  for (const m of measurements) {
    const existing = measurementsByItem.get(m.item_id) || [];
    existing.push(m);
    measurementsByItem.set(m.item_id, existing);
  }

  const itemsByFloor = new Map<string, ConstructionItem[]>();
  for (const item of constructionItems) {
    const existing = itemsByFloor.get(item.floor) || [];
    existing.push(item);
    itemsByFloor.set(item.floor, existing);
  }

  const opCostsBySection = new Map<string, OperationCost[]>();
  for (const cost of operationCosts) {
    const existing = opCostsBySection.get(cost.section) || [];
    existing.push(cost);
    opCostsBySection.set(cost.section, existing);
  }

  // Chart data
  const costBreakdownData = [
    { name: 'Acquisizione', value: results.total_acquisition_cost },
    { name: 'Costi Operativi', value: results.total_operation_cost },
    { name: 'Lavori', value: results.total_construction_cost },
  ].filter(d => d.value > 0);

  const operationSectionData = results.operation_cost_by_section
    .filter(s => s.total > 0)
    .map(s => ({ name: SECTION_LABELS[s.section] || s.section, value: s.total }));

  const constructionFloorData = results.construction_by_floor
    .filter(f => f.total > 0)
    .map(f => ({ name: getFloorLabel(f.floor), value: f.total }));

  const reportDate = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  const createdDate = new Date(project.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <>
      <style jsx global>{`
        @media print {
          body, html {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #report-content,
          #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .print-page-break {
            page-break-before: always;
          }
          @page {
            margin: 12mm 15mm;
            size: A4;
          }
          .recharts-wrapper {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header bar - non stampabile */}
        <div className="no-print mb-8 flex items-center justify-between">
          <div>
            <h1 className="page-header-title flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Genera Report
            </h1>
            <p className="page-header-subtitle">
              Anteprima del report professionale dell&apos;operazione
            </p>
          </div>
          <Button variant="gradient" onClick={() => window.print()} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Stampa / Salva PDF
          </Button>
        </div>

        {/* ============ REPORT CONTENT ============ */}
        <div id="report-content" className="bg-white text-black rounded-2xl shadow-xl overflow-hidden border border-slate-200">

          {/* ======= COVER PAGE ======= */}
          <div className="relative overflow-hidden">
            {/* Header gradient band */}
            <div className="h-2" style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5, #7c3aed)' }} />

            <div className="px-8 md:px-12 pt-10 pb-8">
              {/* Logo + Brand */}
              <div className="flex items-center gap-3 mb-10">
                <div className="w-11 h-11 icon-gradient rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-gradient leading-tight">Impresius</span>
                  <span className="block text-[0.6rem] font-semibold text-slate-400 uppercase tracking-[0.15em]">Report Operazione Immobiliare</span>
                </div>
              </div>

              {/* Project Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                {project.name}
              </h1>

              {project.description && (
                <p className="text-base text-slate-500 mb-6 max-w-2xl leading-relaxed">{project.description}</p>
              )}

              {/* Project Meta */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mb-8">
                {(project.location_city || project.location_province) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {[project.location_address, project.location_city, project.location_province].filter(Boolean).join(', ')}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-500" />
                  {STRATEGY_LABELS[project.strategy] || project.strategy} &middot; {PROPERTY_TYPE_LABELS[project.property_type] || project.property_type}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  {createdDate}
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl p-4 border-l-4 border-blue-500" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)' }}>
                  <p className="text-[0.65rem] font-bold text-blue-600 uppercase tracking-wider mb-1">Costo Totale</p>
                  <p className="text-lg font-extrabold text-slate-900">{formatCurrency(results.total_cost)}</p>
                </div>
                <div className="rounded-xl p-4 border-l-4 border-emerald-500" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)' }}>
                  <p className="text-[0.65rem] font-bold text-emerald-600 uppercase tracking-wider mb-1">Ricavo Totale</p>
                  <p className="text-lg font-extrabold text-slate-900">{formatCurrency(results.total_revenue)}</p>
                </div>
                <div className={cn(
                  "rounded-xl p-4 border-l-4",
                  results.gross_margin >= 0 ? "border-emerald-500" : "border-red-500"
                )} style={{ background: results.gross_margin >= 0 ? 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)' }}>
                  <p className={cn("text-[0.65rem] font-bold uppercase tracking-wider mb-1", results.gross_margin >= 0 ? "text-emerald-600" : "text-red-600")}>Margine</p>
                  <p className={cn("text-lg font-extrabold", results.gross_margin >= 0 ? "text-emerald-700" : "text-red-700")}>{formatCurrency(results.gross_margin)}</p>
                </div>
                <div className="rounded-xl p-4 border-l-4 border-indigo-500" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)' }}>
                  <p className="text-[0.65rem] font-bold text-indigo-600 uppercase tracking-wider mb-1">ROI</p>
                  <p className="text-lg font-extrabold text-slate-900">{formatPercentage(results.roi)}</p>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-8" />
          </div>

          {/* ======= CHARTS SECTION ======= */}
          <div className="px-8 md:px-12 py-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #2563eb, #4f46e5)' }} />
              Analisi Grafica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-2">
              {/* Pie Chart - Cost Breakdown */}
              {costBreakdownData.length > 0 && (
                <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 text-center">Composizione Costi</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={costBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {costBreakdownData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COST_BREAKDOWN_COLORS[index % COST_BREAKDOWN_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Bar Chart - Costi vs Ricavi */}
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 text-center">Costi vs Ricavi vs Margine</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[
                    { name: 'Costi', value: results.total_cost },
                    { name: 'Ricavi', value: results.total_revenue },
                    { name: 'Margine', value: Math.abs(results.gross_margin) },
                  ]} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      <Cell fill="#2563eb" />
                      <Cell fill="#10b981" />
                      <Cell fill={results.gross_margin >= 0 ? '#f59e0b' : '#ef4444'} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Operation Cost by Section */}
              {operationSectionData.length > 0 && (
                <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 text-center">Costi Operativi per Sezione</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={operationSectionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {operationSectionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', fontWeight: 600 }}
                        formatter={(value: string) => value.length > 30 ? value.slice(0, 30) + '...' : value}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Bar Chart - Construction by Floor */}
              {constructionFloorData.length > 0 && (
                <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 text-center">Lavori per Piano</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={constructionFloorData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Importo" radius={[6, 6, 0, 0]}>
                        {constructionFloorData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-8" />

          {/* ======= SECTION A - Riepilogo Economico ======= */}
          <div className="px-8 md:px-12 py-8 print-page-break">
            <SectionHeader number="A" title="Riepilogo Economico" color="#2563eb" />
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                  <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Voce di Costo</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Importo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-blue-50/30">
                  <td className="py-2.5 px-4 text-slate-800 font-medium">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
                    Acquisizione Immobile
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-800 font-semibold">{formatCurrency(results.total_acquisition_cost)}</td>
                </tr>
                {results.operation_cost_by_section.filter(s => s.total > 0).map((section) => (
                  <tr key={section.section} className="border-b border-slate-100 hover:bg-amber-50/30">
                    <td className="py-2.5 px-4 text-slate-800 font-medium">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />
                      {SECTION_LABELS[section.section] || section.section}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-800 font-semibold">{formatCurrency(section.total)}</td>
                  </tr>
                ))}
                {results.construction_by_floor.map((floor) => (
                  <tr key={floor.floor} className="border-b border-slate-100 hover:bg-emerald-50/30">
                    <td className="py-2.5 px-4 text-slate-800 font-medium">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                      Lavori - {getFloorLabel(floor.floor)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-800 font-semibold">{formatCurrency(floor.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  <td className="py-3 px-4 text-white font-bold text-sm">TOTALE COSTI</td>
                  <td className="py-3 px-4 text-right text-white font-bold text-sm">{formatCurrency(results.total_cost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-8" />

          {/* ======= SECTION B - Dettaglio Acquisizione ======= */}
          <div className="px-8 md:px-12 py-8">
            <SectionHeader number="B" title="Dettaglio Acquisizione" color="#2563eb" />
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                  <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Voce</th>
                  <th className="text-center py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Tipo</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Importo</th>
                </tr>
              </thead>
              <tbody>
                {acquisitionCosts.map((cost) => (
                  <tr key={cost.id} className="border-b border-slate-100">
                    <td className="py-2.5 px-4 text-slate-800 font-medium">{cost.label}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold",
                        cost.calculation_type === 'percentage' ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {cost.calculation_type === 'percentage' ? `${formatNumber(cost.percentage)}%` : 'Fisso'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-800 font-semibold">{formatCurrency(calculateAcquisitionAmount(cost))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  <td colSpan={2} className="py-3 px-4 text-white font-bold text-sm">TOTALE ACQUISIZIONE</td>
                  <td className="py-3 px-4 text-right text-white font-bold text-sm">{formatCurrency(results.total_acquisition_cost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-8" />

          {/* ======= SECTION C - Dettaglio Costi Operativi ======= */}
          <div className="px-8 md:px-12 py-8 print-page-break">
            <SectionHeader number="C" title="Dettaglio Costi Operativi" color="#f59e0b" />
            {OPERATION_SECTIONS.map((section) => {
              const sectionCosts = opCostsBySection.get(section.value) || [];
              if (sectionCosts.length === 0) return null;
              const sectionTotal = sectionCosts.reduce((sum, c) => sum + calculateOperationAmount(c), 0);

              return (
                <div key={section.value} className="mb-6">
                  <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider pl-4 border-l-3 border-amber-400" style={{ borderLeftWidth: '3px', borderLeftColor: '#f59e0b' }}>
                    {SECTION_LABELS[section.value]}
                  </h4>
                  <table className="w-full text-sm border-collapse mb-2">
                    <tbody>
                      {sectionCosts.map((cost) => (
                        <tr key={cost.id} className="border-b border-slate-100">
                          <td className="py-2 px-4 text-slate-700">{cost.label}</td>
                          <td className="py-2 px-4 text-right text-slate-800 font-semibold">{formatCurrency(calculateOperationAmount(cost))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-amber-50/50">
                        <td className="py-2 px-4 text-amber-800 font-bold text-xs">Subtotale</td>
                        <td className="py-2 px-4 text-right text-amber-800 font-bold">{formatCurrency(sectionTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }} className="rounded-lg px-4 py-3 flex justify-between text-sm">
              <span className="text-white font-bold">TOTALE COSTI OPERATIVI</span>
              <span className="text-white font-bold">{formatCurrency(results.total_operation_cost)}</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-8" />

          {/* ======= SECTION D - Computo Metrico ======= */}
          <div className="px-8 md:px-12 py-8 print-page-break">
            <SectionHeader number="D" title="Computo Metrico Estimativo" color="#10b981" />
            {FLOORS.map((floor) => {
              const floorItems = itemsByFloor.get(floor.value) || [];
              if (floorItems.length === 0) return null;
              const floorTotal = floorItems.reduce((sum, item) => {
                const itemMeas = measurementsByItem.get(item.id) || [];
                return sum + calculateItemTotal(item, itemMeas);
              }, 0);

              return (
                <div key={floor.value} className="mb-6">
                  <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider pl-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#10b981' }}>
                    {floor.label}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse mb-2">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left py-2 px-3 font-semibold text-slate-500 text-[0.65rem] uppercase tracking-wider border-b border-slate-200">Lavorazione</th>
                          <th className="text-left py-2 px-3 font-semibold text-slate-500 text-[0.65rem] uppercase tracking-wider border-b border-slate-200">Categoria</th>
                          <th className="text-center py-2 px-3 font-semibold text-slate-500 text-[0.65rem] uppercase tracking-wider border-b border-slate-200">U.M.</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-500 text-[0.65rem] uppercase tracking-wider border-b border-slate-200">Qta</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-500 text-[0.65rem] uppercase tracking-wider border-b border-slate-200">P.U.</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-500 text-[0.65rem] uppercase tracking-wider border-b border-slate-200">Totale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {floorItems.map((item) => {
                          const itemMeas = measurementsByItem.get(item.id) || [];
                          const qty = calculateItemQuantity(itemMeas);
                          const total = calculateItemTotal(item, itemMeas);
                          return (
                            <tr key={item.id} className="border-b border-slate-100">
                              <td className="py-1.5 px-3 text-slate-800 font-medium">{item.title}</td>
                              <td className="py-1.5 px-3 text-slate-500 text-xs">{getCategoryLabel(item.category)}</td>
                              <td className="py-1.5 px-3 text-center text-slate-500 text-xs">{item.unit_of_measure}</td>
                              <td className="py-1.5 px-3 text-right text-slate-800">{formatNumber(qty)}</td>
                              <td className="py-1.5 px-3 text-right text-slate-800">{formatCurrency(item.unit_price)}</td>
                              <td className="py-1.5 px-3 text-right text-slate-800 font-semibold">{formatCurrency(total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-emerald-50/50">
                          <td colSpan={5} className="py-2 px-3 text-emerald-800 font-bold text-xs">Subtotale {floor.label}</td>
                          <td className="py-2 px-3 text-right text-emerald-800 font-bold">{formatCurrency(floorTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }} className="rounded-lg px-4 py-3 flex justify-between text-sm">
              <span className="text-white font-bold">TOTALE LAVORI</span>
              <span className="text-white font-bold">{formatCurrency(results.total_construction_cost)}</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-8" />

          {/* ======= SECTION E - Stima Valore di Vendita ======= */}
          <div className="px-8 md:px-12 py-8 print-page-break">
            <SectionHeader number="E" title="Stima Valore di Vendita" color="#8b5cf6" />
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                  <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Unita</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Piano</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Sup. Ragg.</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Val. Calcolato</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider border-b-2 border-slate-200">Prezzo Vendita</th>
                </tr>
              </thead>
              <tbody>
                {results.units_summary.map((unit, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2.5 px-4 text-slate-800 font-semibold">{unit.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{getFloorLabel(unit.floor)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-800">{formatNumber(unit.adjusted_surface)} mq</td>
                    <td className="py-2.5 px-4 text-right text-slate-600">{formatCurrency(unit.calculated_value)}</td>
                    <td className="py-2.5 px-4 text-right text-slate-800 font-bold">{formatCurrency(unit.target_price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  <td colSpan={2} className="py-3 px-4 text-white font-bold text-sm">TOTALE</td>
                  <td className="py-3 px-4 text-right text-white font-bold text-sm">
                    {formatNumber(results.units_summary.reduce((sum, u) => sum + u.adjusted_surface, 0))} mq
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300 font-semibold text-sm">
                    {formatCurrency(results.units_summary.reduce((sum, u) => sum + u.calculated_value, 0))}
                  </td>
                  <td className="py-3 px-4 text-right text-white font-bold text-sm">{formatCurrency(results.total_revenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-8" />

          {/* ======= SECTION F - Indicatori ======= */}
          <div className="px-8 md:px-12 py-8">
            <SectionHeader number="F" title="Indicatori di Performance" color="#7c3aed" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <IndicatorCard
                label="Margine Lordo"
                value={formatCurrency(results.gross_margin)}
                color={results.gross_margin >= 0 ? '#10b981' : '#ef4444'}
                accent={results.gross_margin >= 0 ? '#ecfdf5' : '#fef2f2'}
              />
              <IndicatorCard label="% Margine su Costo" value={formatPercentage(results.margin_percentage)} color="#2563eb" accent="#eff6ff" />
              <IndicatorCard label="% Margine su Ricavo" value={formatPercentage(results.margin_on_revenue)} color="#4f46e5" accent="#eef2ff" />
              <IndicatorCard label="ROI" value={formatPercentage(results.roi)} color="#7c3aed" accent="#f5f3ff" />
              <IndicatorCard label="Costo / mq" value={formatCurrency(results.cost_per_sqm)} color="#0891b2" accent="#ecfeff" />
              <IndicatorCard label="Ricavo / mq" value={formatCurrency(results.revenue_per_sqm)} color="#059669" accent="#ecfdf5" />
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Incidenza sui Costi Totali</h4>
              <div className="space-y-3">
                <IncidenceBar label="Acquisizione" value={results.acquisition_incidence} color="#2563eb" />
                <IncidenceBar label="Costi Operativi" value={results.operation_incidence} color="#f59e0b" />
                <IncidenceBar label="Lavori" value={results.construction_incidence} color="#10b981" />
              </div>
            </div>
          </div>

          {/* ======= FOOTER ======= */}
          <div className="h-1" style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5, #7c3aed)' }} />
          <div className="px-8 md:px-12 py-4 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 icon-gradient rounded flex items-center justify-center">
                <Building2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-gradient">Impresius</span>
            </div>
            <p className="text-[0.6rem] text-slate-400 font-medium">
              Report generato il {reportDate} &middot; Documento riservato
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ======= Sub-components ======= */

function SectionHeader({ number, title, color }: { number: string; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold shadow-sm"
        style={{ background: color }}
      >
        {number}
      </span>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    </div>
  );
}

function IndicatorCard({ label, value, color, accent }: { label: string; value: string; color: string; accent: string }) {
  return (
    <div className="rounded-xl p-4 border border-slate-100" style={{ background: accent, borderLeftWidth: '4px', borderLeftColor: color }}>
      <p className="text-[0.65rem] font-bold uppercase tracking-wider mb-1" style={{ color }}>{label}</p>
      <p className="text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function IncidenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="font-bold" style={{ color }}>{formatPercentage(value)}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}
