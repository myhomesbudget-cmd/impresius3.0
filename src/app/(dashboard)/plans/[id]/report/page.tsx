'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import {
  calculateProjectResults,
  calculateAcquisitionAmount,
  calculateOperationAmount,
  calculateItemTotal,
  calculateItemQuantity,
} from '@/lib/calculations';
import { FLOORS, OPERATION_SECTIONS, CONSTRUCTION_CATEGORIES } from '@/types/database';
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
import { Printer, Loader2, FileText } from 'lucide-react';

const STRATEGY_LABELS: Record<string, string> = {
  ristrutturazione: 'Ristrutturazione',
  frazionamento: 'Frazionamento',
  nuova_costruzione: 'Nuova Costruzione',
  rivendita: 'Rivendita',
};

const SECTION_LABELS: Record<string, string> = {
  management: 'Costi Fissi di Gestione - Vendite - Marketing',
  utilities: 'Costi di Utenze ed Allacciamenti',
  professionals: 'Costi Professionisti',
  permits: 'Costi e Spese Titoli Edilizi',
};

const getFloorLabel = (value: string) => {
  const floor = FLOORS.find((f) => f.value === value);
  return floor ? floor.label : value;
};

const getCategoryLabel = (value: string) => {
  const cat = CONSTRUCTION_CATEGORIES.find((c) => c.value === value);
  return cat ? cat.label : value;
};

export default function ReportPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [results, setResults] = useState<ProjectResults | null>(null);
  const [acquisitionCosts, setAcquisitionCosts] = useState<AcquisitionCost[]>([]);
  const [operationCosts, setOperationCosts] = useState<OperationCost[]>([]);
  const [constructionItems, setConstructionItems] = useState<ConstructionItem[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [surfaces, setSurfaces] = useState<UnitSurface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);

      const [
        { data: projectData },
        { data: unitsData },
        { data: surfacesData },
        { data: acqData },
        { data: opData },
        { data: ciData },
        { data: measData },
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

      const typedUnits = (unitsData || []) as PropertyUnit[];
      const unitIds = typedUnits.map((u) => u.id);
      const projectSurfaces = ((surfacesData || []) as UnitSurface[]).filter((s) =>
        unitIds.includes(s.unit_id)
      );

      const typedItems = (ciData || []) as ConstructionItem[];
      const itemIds = typedItems.map((i) => i.id);
      const projectMeasurements = ((measData || []) as Measurement[]).filter((m) =>
        itemIds.includes(m.item_id)
      );

      const typedAcq = (acqData || []) as AcquisitionCost[];
      const typedOp = (opData || []) as OperationCost[];

      setUnits(typedUnits);
      setSurfaces(projectSurfaces);
      setAcquisitionCosts(typedAcq);
      setOperationCosts(typedOp);
      setConstructionItems(typedItems);
      setMeasurements(projectMeasurements);

      const calculated = calculateProjectResults(
        typedUnits,
        projectSurfaces,
        typedAcq,
        typedOp,
        typedItems,
        projectMeasurements
      );

      setResults(calculated);
      setLoading(false);
    }

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (loading || !results || !project) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Caricamento report...</p>
        </div>
      </div>
    );
  }

  // Build measurement map for construction detail
  const measurementsByItem = new Map<string, Measurement[]>();
  for (const m of measurements) {
    const existing = measurementsByItem.get(m.item_id) || [];
    existing.push(m);
    measurementsByItem.set(m.item_id, existing);
  }

  // Group construction items by floor
  const itemsByFloor = new Map<string, ConstructionItem[]>();
  for (const item of constructionItems) {
    const existing = itemsByFloor.get(item.floor) || [];
    existing.push(item);
    itemsByFloor.set(item.floor, existing);
  }

  // Group operation costs by section
  const opCostsBySection = new Map<string, OperationCost[]>();
  for (const cost of operationCosts) {
    const existing = opCostsBySection.get(cost.section) || [];
    existing.push(cost);
    opCostsBySection.set(cost.section, existing);
  }

  return (
    <>
      <style jsx global>{`
        @media print {
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
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 15mm;
          }
        }
      `}</style>

      <div className="p-8 max-w-5xl mx-auto">
        {/* Header bar */}
        <div className="no-print mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Genera Report
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Anteprima del report completo dell&apos;operazione
            </p>
          </div>
          <Button onClick={() => window.print()} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Stampa / Salva PDF
          </Button>
        </div>

        {/* Report content */}
        <Card id="report-content" className="bg-white text-black">
          <CardContent className="p-8 space-y-10">
            {/* Page 1 - Copertina */}
            <section className="pb-8 border-b border-gray-300">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {project.name}
              </h2>
              <div className="text-sm text-gray-600 space-y-1 mb-6">
                {(project.location_city || project.location_province) && (
                  <p>
                    {[project.location_address, project.location_city, project.location_province]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                <p>Strategia: {STRATEGY_LABELS[project.strategy] || project.strategy}</p>
                <p>
                  Data: {new Date(project.created_at).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Costo Totale</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {formatCurrency(results.total_cost)}
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Ricavo Totale</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {formatCurrency(results.total_revenue)}
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Margine</p>
                  <p
                    className={cn(
                      'text-lg font-bold mt-1',
                      results.gross_margin >= 0 ? 'text-emerald-700' : 'text-red-700'
                    )}
                  >
                    {formatCurrency(results.gross_margin)}
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">ROI</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {formatPercentage(results.roi)}
                  </p>
                </div>
              </div>
            </section>

            {/* Section A - Riepilogo Economico */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                A - Riepilogo Economico
              </h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">
                      Voce di Costo
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">
                      Importo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 text-gray-800">Acquisizione Immobile</td>
                    <td className="py-2 px-3 text-right text-gray-800">
                      {formatCurrency(results.total_acquisition_cost)}
                    </td>
                  </tr>
                  {results.operation_cost_by_section.map((section) => (
                    <tr key={section.section} className="border-b border-gray-200">
                      <td className="py-2 px-3 text-gray-800">
                        {SECTION_LABELS[section.section] || section.section}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-800">
                        {formatCurrency(section.total)}
                      </td>
                    </tr>
                  ))}
                  {results.construction_by_floor.map((floor) => (
                    <tr key={floor.floor} className="border-b border-gray-200">
                      <td className="py-2 px-3 text-gray-800">
                        Lavori - {getFloorLabel(floor.floor)}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-800">
                        {formatCurrency(floor.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-400 bg-gray-50 font-bold">
                    <td className="py-2 px-3 text-gray-900">TOTALE COSTI</td>
                    <td className="py-2 px-3 text-right text-gray-900">
                      {formatCurrency(results.total_cost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </section>

            {/* Section B - Dettaglio Acquisizione */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                B - Dettaglio Acquisizione
              </h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">
                      Voce
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-700">
                      Tipo
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">
                      Importo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {acquisitionCosts.map((cost) => (
                    <tr key={cost.id} className="border-b border-gray-200">
                      <td className="py-2 px-3 text-gray-800">{cost.label}</td>
                      <td className="py-2 px-3 text-center text-gray-600">
                        {cost.calculation_type === 'percentage'
                          ? `${formatNumber(cost.percentage)}%`
                          : 'fisso'}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-800">
                        {formatCurrency(calculateAcquisitionAmount(cost))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-400 bg-gray-50 font-bold">
                    <td colSpan={2} className="py-2 px-3 text-gray-900">
                      TOTALE ACQUISIZIONE
                    </td>
                    <td className="py-2 px-3 text-right text-gray-900">
                      {formatCurrency(results.total_acquisition_cost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </section>

            {/* Section C - Dettaglio Costi Operativi */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                C - Dettaglio Costi Operativi
              </h3>
              {OPERATION_SECTIONS.map((section) => {
                const sectionCosts = opCostsBySection.get(section.value) || [];
                if (sectionCosts.length === 0) return null;

                const sectionTotal = sectionCosts.reduce(
                  (sum, c) => sum + calculateOperationAmount(c),
                  0
                );

                return (
                  <div key={section.value} className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      {SECTION_LABELS[section.value]}
                    </h4>
                    <table className="w-full text-sm border-collapse mb-2">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-1.5 px-3 font-medium text-gray-600">
                            Voce
                          </th>
                          <th className="text-right py-1.5 px-3 font-medium text-gray-600">
                            Importo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectionCosts.map((cost) => (
                          <tr key={cost.id} className="border-b border-gray-100">
                            <td className="py-1.5 px-3 text-gray-800">{cost.label}</td>
                            <td className="py-1.5 px-3 text-right text-gray-800">
                              {formatCurrency(calculateOperationAmount(cost))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-300 font-semibold">
                          <td className="py-1.5 px-3 text-gray-800">Subtotale</td>
                          <td className="py-1.5 px-3 text-right text-gray-800">
                            {formatCurrency(sectionTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}
              <div className="border-t-2 border-gray-400 bg-gray-50 px-3 py-2 flex justify-between font-bold text-sm">
                <span>TOTALE COSTI OPERATIVI</span>
                <span>{formatCurrency(results.total_operation_cost)}</span>
              </div>
            </section>

            {/* Section D - Computo Metrico Estimativo */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                D - Computo Metrico Estimativo
              </h3>
              {FLOORS.map((floor) => {
                const floorItems = itemsByFloor.get(floor.value) || [];
                if (floorItems.length === 0) return null;

                const floorTotal = floorItems.reduce((sum, item) => {
                  const itemMeas = measurementsByItem.get(item.id) || [];
                  return sum + calculateItemTotal(item, itemMeas);
                }, 0);

                return (
                  <div key={floor.value} className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      {floor.label}
                    </h4>
                    <table className="w-full text-sm border-collapse mb-2">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-1.5 px-3 font-medium text-gray-600">
                            Lavorazione
                          </th>
                          <th className="text-left py-1.5 px-3 font-medium text-gray-600">
                            Categoria
                          </th>
                          <th className="text-center py-1.5 px-3 font-medium text-gray-600">
                            U.M.
                          </th>
                          <th className="text-right py-1.5 px-3 font-medium text-gray-600">
                            Quantita
                          </th>
                          <th className="text-right py-1.5 px-3 font-medium text-gray-600">
                            Prezzo Unit.
                          </th>
                          <th className="text-right py-1.5 px-3 font-medium text-gray-600">
                            Totale
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {floorItems.map((item) => {
                          const itemMeas = measurementsByItem.get(item.id) || [];
                          const qty = calculateItemQuantity(itemMeas);
                          const total = calculateItemTotal(item, itemMeas);
                          return (
                            <tr key={item.id} className="border-b border-gray-100">
                              <td className="py-1.5 px-3 text-gray-800">{item.title}</td>
                              <td className="py-1.5 px-3 text-gray-600">
                                {getCategoryLabel(item.category)}
                              </td>
                              <td className="py-1.5 px-3 text-center text-gray-600">
                                {item.unit_of_measure}
                              </td>
                              <td className="py-1.5 px-3 text-right text-gray-800">
                                {formatNumber(qty)}
                              </td>
                              <td className="py-1.5 px-3 text-right text-gray-800">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="py-1.5 px-3 text-right text-gray-800">
                                {formatCurrency(total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-300 font-semibold">
                          <td colSpan={5} className="py-1.5 px-3 text-gray-800">
                            Subtotale {floor.label}
                          </td>
                          <td className="py-1.5 px-3 text-right text-gray-800">
                            {formatCurrency(floorTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}
              <div className="border-t-2 border-gray-400 bg-gray-50 px-3 py-2 flex justify-between font-bold text-sm">
                <span>TOTALE LAVORI</span>
                <span>{formatCurrency(results.total_construction_cost)}</span>
              </div>
            </section>

            {/* Section E - Stima Valore di Vendita */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                E - Stima Valore di Vendita
              </h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">
                      Nome
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">
                      Piano
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">
                      Sup. Ragguagliata
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">
                      Valore Calcolato
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">
                      Prezzo Stabilito
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.units_summary.map((unit, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-2 px-3 text-gray-800 font-medium">{unit.name}</td>
                      <td className="py-2 px-3 text-gray-600">{getFloorLabel(unit.floor)}</td>
                      <td className="py-2 px-3 text-right text-gray-800">
                        {formatNumber(unit.adjusted_surface)} mq
                      </td>
                      <td className="py-2 px-3 text-right text-gray-800">
                        {formatCurrency(unit.calculated_value)}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-800 font-medium">
                        {formatCurrency(unit.target_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-400 bg-gray-50 font-bold">
                    <td colSpan={2} className="py-2 px-3 text-gray-900">
                      TOTALE
                    </td>
                    <td className="py-2 px-3 text-right text-gray-900">
                      {formatNumber(
                        results.units_summary.reduce((sum, u) => sum + u.adjusted_surface, 0)
                      )}{' '}
                      mq
                    </td>
                    <td className="py-2 px-3 text-right text-gray-900">
                      {formatCurrency(
                        results.units_summary.reduce((sum, u) => sum + u.calculated_value, 0)
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-900">
                      {formatCurrency(results.total_revenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </section>

            {/* Section F - Indicatori */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                F - Indicatori
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Margine Lordo</span>
                  <span
                    className={cn(
                      'font-semibold',
                      results.gross_margin >= 0 ? 'text-emerald-700' : 'text-red-700'
                    )}
                  >
                    {formatCurrency(results.gross_margin)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">% Margine su Costo</span>
                  <span className="font-semibold text-gray-900">
                    {formatPercentage(results.margin_percentage)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">% Margine su Ricavo</span>
                  <span className="font-semibold text-gray-900">
                    {formatPercentage(results.margin_on_revenue)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">ROI</span>
                  <span className="font-semibold text-gray-900">
                    {formatPercentage(results.roi)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Costo / mq</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.cost_per_sqm)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Ricavo / mq</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.revenue_per_sqm)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Incidenza Acquisizione</span>
                  <span className="font-semibold text-gray-900">
                    {formatPercentage(results.acquisition_incidence)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Incidenza Costruzione</span>
                  <span className="font-semibold text-gray-900">
                    {formatPercentage(results.construction_incidence)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Incidenza Costi Operativi</span>
                  <span className="font-semibold text-gray-900">
                    {formatPercentage(results.operation_incidence)}
                  </span>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
