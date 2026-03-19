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
import { Printer, Loader2, FileText, MapPin, Building2 } from 'lucide-react';
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
  management: 'Costi Fissi (Gestione, Vendite, Marketing)',
  utilities: 'Costi di Utenze ed Allacciamenti',
  professionals: 'Costi Professionisti',
  permits: 'Costi e Spese Titoli Edilizi',
};

// Combinazione di colori severa/aziendale per i grafici
const CHART_COLORS = ['#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
const COST_BREAKDOWN_COLORS = ['#1e293b', '#64748b', '#cbd5e1'];

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
    <div className="bg-white border text-slate-800 border-slate-300 rounded shadow-sm p-2 text-xs">
      {label && <p className="font-semibold mb-1 border-b pb-1">{label}</p>}
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color }} className="font-medium mt-1">
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
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Generazione Documento...</p>
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
    { name: 'Cost. Operativi', value: results.total_operation_cost },
    { name: 'Lavori', value: results.total_construction_cost },
  ].filter(d => d.value > 0);

  const operationSectionData = results.operation_cost_by_section
    .filter(s => s.total > 0)
    .map(s => ({ name: SECTION_LABELS[s.section] || s.section, value: s.total }));

  const reportDate = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <>
      <style jsx global>{`
        @media print {
          body, html {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
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
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page-break {
            page-break-before: always;
          }
          .print-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          @page {
            margin: 15mm 20mm;
            size: A4;
          }
          /* Fix per gradienti visibili ai bordi delle celle nere in alcune stampanti */
          th { border-bottom: 2px solid #000 !important; }
        }
      `}</style>

      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header bar - non stampabile */}
        <div className="no-print mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
              <FileText className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Documento Ufficiale</h1>
              <p className="text-sm text-slate-500 font-medium">Anteprima di stampa dell&apos;Executive Summary</p>
            </div>
          </div>
          <Button variant="default" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md px-5" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            Stampa / Genera PDF
          </Button>
        </div>

        {/* ============ REPORT CONTENT ============ */}
        <div id="report-content" className="bg-white text-slate-900 mx-auto max-w-[210mm] shadow-2xl print:shadow-none print:max-w-full">
          
          {/* FOGLIO A4 PADDING */}
          <div className="p-10 md:p-14">
            
            {/* INTESTAZIONE DOCUMENTO */}
            <div className="border-b-4 border-slate-900 pb-5 mb-8 flex justify-between items-end">
              <div className="max-w-[70%]">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-6 h-6 text-slate-800" />
                  <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-slate-500">Impresius Pro</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-slate-900 leading-none">
                  {project.name}
                </h1>
                {project.location_address && (
                  <p className="text-sm text-slate-600 font-medium mt-3 flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-3.5 h-3.5" />
                    {[project.location_address, project.location_city, project.location_province].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              <div className="text-right pb-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">DOCUMENTO</div>
                <div className="text-lg font-black text-slate-900 tracking-tight">EXECUTIVE SUMMARY</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Data emissione: {reportDate}</div>
              </div>
            </div>

            {/* DESCRIPTION IN LINE WITH A4 FORMAT */}
            {project.description && (
              <p className="text-sm text-slate-700 leading-relaxed mb-6 italic border-l-2 border-slate-300 pl-4 py-1">
                &ldquo;{project.description}&rdquo;
              </p>
            )}

            {/* PROJECT META GRID */}
            <div className="grid grid-cols-3 gap-6 mb-8 mt-4">
              <div className="border-l-2 border-slate-300 pl-3">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Strategia Operativa</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{STRATEGY_LABELS[project.strategy] || project.strategy}</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-3">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tipologia Immobile</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{PROPERTY_TYPE_LABELS[project.property_type] || project.property_type}</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-3">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Superficie Target</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {formatNumber(results.units_summary.reduce((sum, u) => sum + u.adjusted_surface, 0))} mq
                </div>
              </div>
            </div>

            {/* KEY METRICS GRID COMPACT BANCARIO */}
            <div className="grid grid-cols-4 gap-px bg-slate-300 border border-slate-300 mb-10 overflow-hidden rounded-sm">
              <div className="bg-white p-4">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Costo Totale</div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(results.total_cost)}</div>
              </div>
              <div className="bg-white p-4">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Ricavo Stimato</div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(results.total_revenue)}</div>
              </div>
              <div className="bg-white p-4">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Margine Operativo</div>
                <div className={cn("text-xl font-bold tracking-tight", results.gross_margin >= 0 ? "text-slate-900" : "text-red-700")}>
                  {formatCurrency(results.gross_margin)}
                </div>
              </div>
              <div className="bg-slate-50 p-4 border-l border-slate-200">
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">ROI (Ritorno)</div>
                <div className={cn("text-xl font-bold tracking-tight", results.gross_margin >= 0 ? "text-slate-900" : "text-red-700")}>
                  {formatPercentage(results.roi)}
                </div>
              </div>
            </div>

            {/* GRAFICI A GRIGLIA COMPATTA */}
            <div className="grid grid-cols-2 gap-6 mb-12 print-break-inside-avoid">
              {costBreakdownData.length > 0 && (
                <div className="border border-slate-200 p-4 rounded-sm bg-slate-50/50">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-3 pb-2 border-b border-slate-200">
                    Composizione Spese
                  </div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={costBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {costBreakdownData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COST_BREAKDOWN_COLORS[index % COST_BREAKDOWN_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={24} iconType="square" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="border border-slate-200 p-4 rounded-sm bg-slate-50/50">
                <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-3 pb-2 border-b border-slate-200">
                  Flussi (Spese vs Valore)
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={[
                    { name: 'Costi', value: results.total_cost },
                    { name: 'Ricavi', value: results.total_revenue },
                    { name: 'Margine', value: Math.abs(results.gross_margin) },
                  ]} barSize={28} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 600, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      <Cell fill="#64748b" />
                      <Cell fill="#1e293b" />
                      <Cell fill={results.gross_margin >= 0 ? '#94a3b8' : '#ef4444'} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ======= SECTION A - Riepilogo Economico ======= */}
            <div className="mb-10 print-break-inside-avoid">
              <SectionHeader id="A" title="Conto Economico di Sintesi" />
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-800">
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider w-2/3">Voce di Costo / Sezione</th>
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-right w-1/3">Importo Valutato</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2.5 px-2 font-semibold text-slate-800">1. Acquisizione Immobile</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-700">{formatCurrency(results.total_acquisition_cost)}</td>
                  </tr>
                  {results.operation_cost_by_section.filter(s => s.total > 0).map((section, idx) => (
                    <tr key={section.section} className="border-b border-slate-200">
                      <td className="py-2.5 px-2 font-semibold text-slate-800">2.{idx+1} {SECTION_LABELS[section.section] || section.section}</td>
                      <td className="py-2.5 px-2 text-right font-medium text-slate-700">{formatCurrency(section.total)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-slate-200">
                    <td className="py-2.5 px-2 font-semibold text-slate-800">3. Interventi e Opere Edili</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-700">{formatCurrency(results.total_construction_cost)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-b-2 border-slate-800 bg-slate-50">
                    <td className="py-3 px-2 font-bold text-slate-900 uppercase">Totale Capitale Investito (Costi)</td>
                    <td className="py-3 px-2 text-right font-bold text-slate-900">{formatCurrency(results.total_cost)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ======= SECTION B - Dettaglio ======= */}
            <div className="mb-10 print-break-inside-avoid print-page-break">
              <SectionHeader id="B" title="Dettaglio: Costi Operativi e Gestione" />
              {OPERATION_SECTIONS.map((section) => {
                const sectionCosts = opCostsBySection.get(section.value) || [];
                if (sectionCosts.length === 0) return null;
                const sectionTotal = sectionCosts.reduce((sum, c) => sum + calculateOperationAmount(c), 0);

                return (
                  <div key={section.value} className="mb-6">
                    <h4 className="text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-widest border-l-2 border-slate-400 pl-2">
                      {SECTION_LABELS[section.value]}
                    </h4>
                    <table className="w-full text-xs text-left mb-2">
                      <tbody>
                        {sectionCosts.map((cost) => (
                          <tr key={cost.id} className="border-b border-slate-100">
                            <td className="py-1.5 px-2 text-slate-700">{cost.label}</td>
                            <td className="py-1.5 px-2 text-right font-medium text-slate-700 w-1/3 text-[11px]">{formatCurrency(calculateOperationAmount(cost))}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="py-1.5 px-2 font-semibold text-slate-800 text-right text-[10px] uppercase">Subtotale:</td>
                          <td className="py-1.5 px-2 text-right font-bold text-slate-900 border-t border-slate-300 bg-slate-50">{formatCurrency(sectionTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* ======= SECTION C - Computo Metrico ======= */}
            <div className="mb-10 print-break-inside-avoid print-page-break">
              <SectionHeader id="C" title="Sintesi Computo Metrico Estimativo" />
              {FLOORS.map((floor) => {
                const floorItems = itemsByFloor.get(floor.value) || [];
                if (floorItems.length === 0) return null;
                const floorTotal = floorItems.reduce((sum, item) => {
                  const itemMeas = measurementsByItem.get(item.id) || [];
                  return sum + calculateItemTotal(item, itemMeas);
                }, 0);

                return (
                  <div key={floor.value} className="mb-8">
                    <h4 className="text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-widest border-l-2 border-slate-400 pl-2">
                      Misure {floor.label}
                    </h4>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-y border-slate-300 bg-slate-50">
                          <th className="py-1.5 px-2 font-semibold text-slate-600">Lavorazione</th>
                          <th className="py-1.5 px-2 font-semibold text-slate-600 text-center w-12">U.M.</th>
                          <th className="py-1.5 px-2 font-semibold text-slate-600 text-right w-16">Q.tà</th>
                          <th className="py-1.5 px-2 font-semibold text-slate-600 text-right w-20">P. Unit.</th>
                          <th className="py-1.5 px-2 font-semibold text-slate-800 text-right w-24">Totale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {floorItems.map((item) => {
                          const itemMeas = measurementsByItem.get(item.id) || [];
                          const qty = calculateItemQuantity(itemMeas);
                          const total = calculateItemTotal(item, itemMeas);
                          return (
                            <tr key={item.id} className="border-b border-slate-100">
                              <td className="py-1.5 px-2 text-slate-800 font-medium">{item.title}
                                <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{getCategoryLabel(item.category)}</div>
                              </td>
                              <td className="py-1.5 px-2 text-center text-slate-600">{item.unit_of_measure}</td>
                              <td className="py-1.5 px-2 text-right text-slate-700">{formatNumber(qty)}</td>
                              <td className="py-1.5 px-2 text-right text-slate-700">{formatCurrency(item.unit_price)}</td>
                              <td className="py-1.5 px-2 text-right font-semibold text-slate-800">{formatCurrency(total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="py-2 px-2 text-right font-semibold uppercase text-[10px] text-slate-600">Totale {floor.label}:</td>
                          <td className="py-2 px-2 text-right font-bold text-slate-900 border-t-2 border-slate-800 bg-slate-50">{formatCurrency(floorTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* ======= SECTION D - Stima e Unita ======= */}
            <div className="mb-8 print-break-inside-avoid print-page-break">
              <SectionHeader id="D" title="Quadro Unità e Stima Valore Base" />
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-800">
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider">Unità Formata</th>
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-right">Sup. Comm.</th>
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-right">Val. Statistico</th>
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-right">Target Price (Vendita)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.units_summary.map((unit, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="py-2 px-2 font-medium text-slate-800">
                        {unit.name} <span className="text-slate-500 font-normal">({getFloorLabel(unit.floor)})</span>
                      </td>
                      <td className="py-2 px-2 text-right text-slate-700">{formatNumber(unit.adjusted_surface)} mq</td>
                      <td className="py-2 px-2 text-right text-slate-500">{formatCurrency(unit.calculated_value)}</td>
                      <td className="py-2 px-2 text-right font-bold text-slate-900">{formatCurrency(unit.target_price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-b-2 border-slate-800 bg-slate-50">
                    <td className="py-3 px-2 font-bold text-slate-900 uppercase">Totale Asset</td>
                    <td className="py-3 px-2 text-right font-bold text-slate-900">{formatNumber(results.units_summary.reduce((sum, u) => sum + u.adjusted_surface, 0))} mq</td>
                    <td className="py-3 px-2 flex-grow border-0"></td>
                    <td className="py-3 px-2 text-right font-bold text-slate-900">{formatCurrency(results.total_revenue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ======= SECTION INCIDETIONS ======= */}
            <div className="mt-12 pt-8 border-t-2 border-slate-900 print-break-inside-avoid">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1">Rapporti di Incidenza</h3>
                  <p className="text-xs text-slate-500">Valutazione delle aliquote sul Costo Totale</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-800 uppercase mb-1.5"><span>Acquisizione</span><span>{formatPercentage(results.acquisition_incidence)}</span></div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-sm overflow-hidden"><div className="h-full bg-slate-900" style={{ width: `${Math.min(results.acquisition_incidence, 100)}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-800 uppercase mb-1.5"><span>Lavorazioni Edili</span><span>{formatPercentage(results.construction_incidence)}</span></div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-sm overflow-hidden"><div className="h-full bg-slate-700" style={{ width: `${Math.min(results.construction_incidence, 100)}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-800 uppercase mb-1.5"><span>Oneri e C. Operativi</span><span>{formatPercentage(results.operation_incidence)}</span></div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-sm overflow-hidden"><div className="h-full bg-slate-500" style={{ width: `${Math.min(results.operation_incidence, 100)}%` }} /></div>
                </div>
              </div>
            </div>

          </div>
          
          {/* FOGLIO A4 FOOTER BAND */}
          <div className="bg-slate-900 px-10 md:px-14 py-4 flex items-center justify-between text-white">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">{project.name} &middot; Confidential</span>
            <span className="text-[10px] font-medium opacity-70">Generato con Impresius Pro V3</span>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper components strictly for the report
function SectionHeader({ id, title }: { id: string; title: string }) {
  return (
    <div className="border-b border-slate-900 pb-2 mb-4">
      <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">
        <span className="text-slate-400 mr-2">{id}.</span> {title}
      </h2>
    </div>
  );
}
