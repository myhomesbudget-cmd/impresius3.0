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

// Combinazione di colori Nero, Grigio, Oro (Gold) per i grafici
const CHART_COLORS = ['#000000', '#d4af37', '#4b5563', '#9ca3af', '#facc15', '#1f2937'];
const COST_BREAKDOWN_COLORS = ['#000000', '#d4af37', '#9ca3af'];

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
    <div className="bg-white border text-black border-gray-300 rounded shadow-sm p-2 text-xs">
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
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Generazione Documento...</p>
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
          /* Margini perfetti da 1.5 cm */
          @page {
            margin: 15mm 15mm;
            size: A4;
          }
          .print-page-break {
            page-break-before: always;
          }
          .print-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          th { border-bottom: 2px solid #000 !important; }
        }
      `}</style>

      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header bar - non stampabile */}
        <div className="no-print mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2.5 rounded-lg border border-gray-200">
              <FileText className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">Documento Analisi Immobile</h1>
              <p className="text-sm text-gray-500 font-medium">Layout professionale A4, palette Nero, Grigio, Oro</p>
            </div>
          </div>
          <Button variant="default" className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white rounded-md px-5 border border-[#d4af37]" onClick={() => window.print()}>
            <Printer className="w-4 h-4 text-[#d4af37]" />
            Stampa / Genera PDF
          </Button>
        </div>

        {/* ============ REPORT CONTENT ============ */}
        <div id="report-content" className="bg-white text-black mx-auto max-w-[210mm] shadow-2xl print:shadow-none print:max-w-full">
          
          {/* FOGLIO A4 PADDING FRONTALE */}
          <div className="p-8 md:p-12">
            
            {/* INTESTAZIONE DOCUMENTO */}
            <div className="border-b-[3px] border-black pb-5 mb-8 flex justify-between items-end">
              <div className="max-w-[70%]">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-6 h-6 text-[#d4af37]" />
                  <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-gray-500">Impresius Pro</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-black leading-none">
                  {project.name}
                </h1>
                {project.location_address && (
                  <p className="text-sm text-gray-600 font-medium mt-3 flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    {[project.location_address, project.location_city, project.location_province].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              <div className="text-right pb-1">
                <div className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-1">DOCUMENTO</div>
                <div className="text-lg font-black text-black tracking-tight">EXECUTIVE SUMMARY</div>
                <div className="text-xs text-gray-500 font-medium mt-1">Data emissione: {reportDate}</div>
              </div>
            </div>

            {/* DESCRIPTION */}
            {project.description && (
              <p className="text-sm text-gray-700 leading-relaxed mb-6 italic border-l-2 border-[#d4af37] pl-4 py-1">
                &ldquo;{project.description}&rdquo;
              </p>
            )}

            {/* PROJECT META GRID */}
            <div className="grid grid-cols-3 gap-6 mb-8 mt-4">
              <div className="border-l-2 border-[#d4af37] pl-3">
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Strategia Operativa</div>
                <div className="text-sm font-semibold text-black mt-0.5">{STRATEGY_LABELS[project.strategy] || project.strategy}</div>
              </div>
              <div className="border-l-2 border-[#d4af37] pl-3">
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Tipologia Immobile</div>
                <div className="text-sm font-semibold text-black mt-0.5">{PROPERTY_TYPE_LABELS[project.property_type] || project.property_type}</div>
              </div>
              <div className="border-l-2 border-[#d4af37] pl-3">
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Superficie Target</div>
                <div className="text-sm font-semibold text-black mt-0.5">
                  {formatNumber(results.units_summary.reduce((sum, u) => sum + u.adjusted_surface, 0))} mq
                </div>
              </div>
            </div>

            {/* KEY METRICS GRID COMPACT BANCARIO */}
            <div className="grid grid-cols-4 gap-px bg-gray-300 border border-gray-300 mb-10 overflow-hidden rounded-sm">
              <div className="bg-white p-4">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Costo Totale</div>
                <div className="text-xl font-bold text-black tracking-tight">{formatCurrency(results.total_cost)}</div>
              </div>
              <div className="bg-white p-4">
                <div className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider mb-1">Ricavo Stimato</div>
                <div className="text-xl font-bold text-black tracking-tight">{formatCurrency(results.total_revenue)}</div>
              </div>
              <div className="bg-white p-4">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Margine Operativo</div>
                <div className={cn("text-xl font-bold tracking-tight", results.gross_margin >= 0 ? "text-black" : "text-red-700")}>
                  {formatCurrency(results.gross_margin)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 border-l border-gray-200">
                <div className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider mb-1">ROI (Ritorno)</div>
                <div className={cn("text-xl font-bold tracking-tight", results.gross_margin >= 0 ? "text-black" : "text-red-700")}>
                  {formatPercentage(results.roi)}
                </div>
              </div>
            </div>

            {/* GRAFICI A GRIGLIA COMPATTA */}
            <div className="grid grid-cols-2 gap-6 mb-12 print-break-inside-avoid">
              {costBreakdownData.length > 0 && (
                <div className="border border-gray-200 p-4 rounded-sm bg-[#fafafa]">
                  <div className="text-[10px] font-bold text-black uppercase tracking-widest mb-3 pb-2 border-b border-[#d4af37]">
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

              <div className="border border-gray-200 p-4 rounded-sm bg-[#fafafa]">
                <div className="text-[10px] font-bold text-black uppercase tracking-widest mb-3 pb-2 border-b border-[#d4af37]">
                  Flussi (Spese vs Valore)
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={[
                    { name: 'Costi', value: results.total_cost },
                    { name: 'Ricavi', value: results.total_revenue },
                    { name: 'Margine', value: Math.abs(results.gross_margin) },
                  ]} barSize={28} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 600, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      <Cell fill="#000000" />
                      <Cell fill="#d4af37" />
                      <Cell fill={results.gross_margin >= 0 ? '#9ca3af' : '#ef4444'} />
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
                  <tr className="border-b-2 border-black text-black">
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider w-2/3">Voce di Costo / Sezione</th>
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-right w-1/3">Importo Valutato</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2.5 px-2 font-semibold text-black">1. Acquisizione Immobile</td>
                    <td className="py-2.5 px-2 text-right font-medium text-gray-700">{formatCurrency(results.total_acquisition_cost)}</td>
                  </tr>
                  {results.operation_cost_by_section.filter(s => s.total > 0).map((section, idx) => (
                    <tr key={section.section} className="border-b border-gray-200">
                      <td className="py-2.5 px-2 font-semibold text-black">2.{idx+1} {SECTION_LABELS[section.section] || section.section}</td>
                      <td className="py-2.5 px-2 text-right font-medium text-gray-700">{formatCurrency(section.total)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-gray-200">
                    <td className="py-2.5 px-2 font-semibold text-black">3. Interventi e Opere Edili</td>
                    <td className="py-2.5 px-2 text-right font-medium text-gray-700">{formatCurrency(results.total_construction_cost)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-b-2 border-black bg-gray-50">
                    <td className="py-3 px-2 font-bold text-black uppercase">Totale Capitale Investito (Costi)</td>
                    <td className="py-3 px-2 text-right font-bold text-black">{formatCurrency(results.total_cost)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* ======= FINE PAGINA 1: Interruzione pagina ------- */}
            <div className="print-page-break"></div>

            {/* ======= SECTION B - Dettaglio ======= */}
            <div className="mb-10 pt-6 print-break-inside-avoid">
              <SectionHeader id="B" title="Dettaglio: Costi Operativi e Gestione" />
              {OPERATION_SECTIONS.map((section) => {
                const sectionCosts = opCostsBySection.get(section.value) || [];
                if (sectionCosts.length === 0) return null;
                const sectionTotal = sectionCosts.reduce((sum, c) => sum + calculateOperationAmount(c), 0);

                return (
                  <div key={section.value} className="mb-6">
                    <h4 className="text-[11px] font-bold text-[#d4af37] mb-1 uppercase tracking-widest border-l-2 border-black pl-2">
                      {SECTION_LABELS[section.value]}
                    </h4>
                    <table className="w-full text-xs text-left mb-2 border-collapse">
                      <tbody>
                        {sectionCosts.map((cost) => (
                          <tr key={cost.id} className="border-b border-gray-100">
                            <td className="py-1.5 px-2 text-gray-800">{cost.label}</td>
                            <td className="py-1.5 px-2 text-right font-medium text-gray-800 w-1/3 text-[11px]">{formatCurrency(calculateOperationAmount(cost))}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="py-1.5 px-2 font-bold text-black text-right text-[10px] uppercase">Subtotale:</td>
                          <td className="py-1.5 px-2 text-right font-bold text-black border-t border-gray-300 bg-gray-50">{formatCurrency(sectionTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}
            </div>
            
            {/* ======= SECTION INCIDETIONS ======= */}
            <div className="mb-12 pt-8 border-t-[3px] border-black print-break-inside-avoid">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">Rapporti di Incidenza</h3>
                  <p className="text-xs text-gray-500">Valutazione delle aliquote sul Costo Totale</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-black uppercase mb-1.5"><span>Acquisizione</span><span>{formatPercentage(results.acquisition_incidence)}</span></div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-sm overflow-hidden"><div className="h-full bg-black" style={{ width: `${Math.min(results.acquisition_incidence, 100)}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-[#d4af37] uppercase mb-1.5"><span>Lavorazioni Edili</span><span className="text-black">{formatPercentage(results.construction_incidence)}</span></div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-sm overflow-hidden"><div className="h-full bg-[#d4af37]" style={{ width: `${Math.min(results.construction_incidence, 100)}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-600 uppercase mb-1.5"><span>Costi Operativi</span><span className="text-black">{formatPercentage(results.operation_incidence)}</span></div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-sm overflow-hidden"><div className="h-full bg-gray-500" style={{ width: `${Math.min(results.operation_incidence, 100)}%` }} /></div>
                </div>
              </div>
            </div>

            {/* ======= FINE PAGINA 2: Interruzione pagina ------- */}
            <div className="print-page-break"></div>

            {/* ======= SECTION C - Computo Metrico ======= */}
            <div className="mb-10 pt-6">
              <SectionHeader id="C" title="Sintesi Computo Metrico Estimativo" />
              {FLOORS.map((floor) => {
                const floorItems = itemsByFloor.get(floor.value) || [];
                if (floorItems.length === 0) return null;
                const floorTotal = floorItems.reduce((sum, item) => {
                  const itemMeas = measurementsByItem.get(item.id) || [];
                  return sum + calculateItemTotal(item, itemMeas);
                }, 0);

                return (
                  <div key={floor.value} className="mb-8 print-break-inside-avoid">
                    <h4 className="text-[11px] font-bold text-[#d4af37] mb-2 uppercase tracking-widest border-l-2 border-black pl-2">
                      Piano: {floor.label}
                    </h4>
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="border-y border-gray-300 bg-gray-50">
                          <th className="py-1.5 px-2 font-bold text-black uppercase">Lavorazione</th>
                          <th className="py-1.5 px-2 font-bold text-black text-center w-12 uppercase">U.M.</th>
                          <th className="py-1.5 px-2 font-bold text-black text-right w-16 uppercase">Q.tà</th>
                          <th className="py-1.5 px-2 font-bold text-black text-right w-20 uppercase">P. Unit.</th>
                          <th className="py-1.5 px-2 font-bold text-[#d4af37] text-right w-24 uppercase">Totale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {floorItems.map((item) => {
                          const itemMeas = measurementsByItem.get(item.id) || [];
                          const qty = calculateItemQuantity(itemMeas);
                          const total = calculateItemTotal(item, itemMeas);
                          return (
                            <tr key={item.id} className="border-b border-gray-100">
                              <td className="py-2 px-2 text-black font-semibold">{item.title}
                                <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">{getCategoryLabel(item.category)}</div>
                              </td>
                              <td className="py-2 px-2 text-center text-gray-600">{item.unit_of_measure}</td>
                              <td className="py-2 px-2 text-right text-gray-800">{formatNumber(qty)}</td>
                              <td className="py-2 px-2 text-right text-gray-800">{formatCurrency(item.unit_price)}</td>
                              <td className="py-2 px-2 text-right font-bold text-black">{formatCurrency(total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="py-2 px-2 text-right font-bold uppercase text-[10px] text-gray-600">Totale {floor.label}:</td>
                          <td className="py-2 px-2 text-right font-bold text-black border-t-2 border-black bg-gray-50">{formatCurrency(floorTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* ======= FINE PAGINA 3: Interruzione pagina ------- */}
            <div className="print-page-break"></div>

            {/* ======= SECTION D - Stima e Unita ======= */}
            <div className="mb-8 pt-6 print-break-inside-avoid">
              <SectionHeader id="D" title="Quadro Unità e Stima Valori di Uscita" />
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b-[3px] border-black text-black">
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider">Unità Formata</th>
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-right">Sup. Comm.</th>
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-right">Val. Statistico</th>
                    <th className="py-2.5 px-2 font-bold uppercase tracking-wider text-right text-[#d4af37]">Target Price (Vendita)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.units_summary.map((unit, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 px-2 font-semibold text-black uppercase">
                        {unit.name} <span className="text-gray-400 font-normal">({getFloorLabel(unit.floor)})</span>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-800">{formatNumber(unit.adjusted_surface)} mq</td>
                      <td className="py-3 px-2 text-right text-gray-500">{formatCurrency(unit.calculated_value)}</td>
                      <td className="py-3 px-2 text-right font-extrabold text-black">{formatCurrency(unit.target_price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-b-[3px] border-black bg-gray-50">
                    <td className="py-3 px-2 font-black text-black uppercase tracking-widest text-[10px]">Totale Asset Formato</td>
                    <td className="py-3 px-2 text-right font-bold text-black">{formatNumber(results.units_summary.reduce((sum, u) => sum + u.adjusted_surface, 0))} mq</td>
                    <td className="py-3 px-2 flex-grow border-0"></td>
                    <td className="py-3 px-2 text-right font-black text-black text-sm">{formatCurrency(results.total_revenue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>
          
          {/* FOGLIO A4 FOOTER BAND */}
          <div className="bg-black px-10 md:px-14 py-4 flex items-center justify-between text-white">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#d4af37]">{project.name} &middot; Confidential</span>
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
    <div className="border-b border-black pb-2 mb-4">
      <h2 className="text-sm font-extrabold text-black uppercase tracking-wide">
        <span className="text-[#d4af37] mr-2">{id}.</span> {title}
      </h2>
    </div>
  );
}
