// =============================================
// IMPRESIUS 3.0 - Motore di Calcolo Canonico
// =============================================
//
// Questo modulo e la UNICA fonte di verita per tutti i calcoli
// economico-finanziari del sistema. Nessun'altra parte dell'app
// deve ricalcolare KPI, margini o incidenze con logiche proprie.
//
// Convenzioni di arrotondamento:
// - Tutti gli importi monetari sono arrotondati a 2 decimali
//   con Math.round(x * 100) / 100 (half-away-from-zero).
// - Le percentuali sono arrotondamento a 2 decimali.
// - Le superfici ragguagliate sono arrotondate a 2 decimali.
//
// Glossario indicatori:
// - gross_margin: Ricavo totale - Costo totale
// - margin_percentage: (gross_margin / total_cost) × 100
//   → indica il guadagno per ogni euro investito
// - margin_on_revenue: (gross_margin / total_revenue) × 100
//   → indica la quota di ricavo che resta come margine
// - roi: identico a margin_percentage (Return on Investment)
// - acquisition_incidence: (total_acquisition_cost / total_cost) × 100
// - construction_incidence: (total_construction_cost / total_cost) × 100
// - operation_incidence: (total_operation_cost / total_cost) × 100
//
// Le tre incidenze sommano sempre a 100% (entro margine di arrotondamento).
//

import type {
  PropertyUnit,
  UnitSurface,
  AcquisitionCost,
  OperationCost,
  ConstructionItem,
  Measurement,
  ProjectResults,
} from '@/types/database';

/**
 * Calcola la quantita di una singola misurazione.
 * Logica: se un campo e 0, viene ignorato nel prodotto.
 * Se tutti i campi sono 0, restituisce 0.
 */
export function calculateMeasurementQuantity(m: Measurement): number {
  const parts = Number(m.parts) || 0;
  const length = Number(m.length) || 0;
  const width = Number(m.width) || 0;
  const height = Number(m.height_weight) || 0;

  // Se parts !== 0 e tutti gli altri sono 0, la quantita e parts stessa
  if (parts !== 0 && length === 0 && width === 0 && height === 0) {
    return parts;
  }

  // Altrimenti moltiplica solo i valori !== 0
  let result = 1;
  let hasValue = false;

  if (parts !== 0) { result *= parts; hasValue = true; }
  if (length !== 0) { result *= length; hasValue = true; }
  if (width !== 0) { result *= width; hasValue = true; }
  if (height !== 0) { result *= height; hasValue = true; }

  return hasValue ? result : 0;
}

/**
 * Calcola la quantita totale di una voce di computo (somma misurazioni)
 */
export function calculateItemQuantity(measurements: Measurement[]): number {
  return measurements.reduce((sum, m) => sum + calculateMeasurementQuantity(m), 0);
}

/**
 * Calcola il totale di una voce di computo
 */
export function calculateItemTotal(item: ConstructionItem, measurements: Measurement[]): number {
  const quantity = calculateItemQuantity(measurements);
  return Math.round(quantity * item.unit_price * 100) / 100;
}

/**
 * Calcola la superficie ragguagliata
 */
export function calculateAdjustedSurface(surface: UnitSurface): number {
  return Math.round(surface.gross_surface * surface.coefficient * 100) / 100;
}

/**
 * Calcola il valore di una superficie
 */
export function calculateSurfaceValue(surface: UnitSurface, marketPriceSqm: number): number {
  const adjustedSurface = calculateAdjustedSurface(surface);
  const price = surface.unit_price || marketPriceSqm;
  return Math.round(adjustedSurface * price * 100) / 100;
}

/**
 * Calcola il valore totale di un'unita immobiliare
 */
export function calculateUnitValue(unit: PropertyUnit, surfaces: UnitSurface[]): {
  calculatedValue: number;
  totalAdjustedSurface: number;
} {
  let calculatedValue = 0;
  let totalAdjustedSurface = 0;

  for (const surface of surfaces) {
    const adjusted = calculateAdjustedSurface(surface);
    totalAdjustedSurface += adjusted;
    calculatedValue += calculateSurfaceValue(surface, unit.market_price_sqm);
  }

  return {
    calculatedValue: Math.round(calculatedValue * 100) / 100,
    totalAdjustedSurface: Math.round(totalAdjustedSurface * 100) / 100,
  };
}

/**
 * Calcola l'importo di un costo di acquisizione
 */
export function calculateAcquisitionAmount(cost: AcquisitionCost): number {
  if (cost.calculation_type === 'percentage') {
    return Math.round(cost.base_value * cost.percentage / 100 * 100) / 100;
  }
  return cost.fixed_amount;
}

/**
 * Calcola l'importo di un costo operativo
 */
export function calculateOperationAmount(cost: OperationCost): number {
  switch (cost.calculation_type) {
    case 'percentage':
      return Math.round(cost.base_value * cost.percentage / 100 * 100) / 100;
    case 'unit_quantity':
      return Math.round(cost.unit_price * cost.quantity * 100) / 100;
    case 'fixed':
    default:
      return cost.unit_price || 0;
  }
}

/**
 * Calcola i risultati completi dell'operazione
 */
export function calculateProjectResults(
  units: PropertyUnit[],
  surfaces: UnitSurface[],
  acquisitionCosts: AcquisitionCost[],
  operationCosts: OperationCost[],
  constructionItems: ConstructionItem[],
  measurements: Measurement[],
): ProjectResults {
  // --- RICAVI ---
  const unitsSummary: ProjectResults['units_summary'] = [];
  let totalRevenue = 0;
  let totalAdjustedSurface = 0;

  for (const unit of units) {
    const unitSurfaces = surfaces.filter(s => s.unit_id === unit.id);
    const { calculatedValue, totalAdjustedSurface: adjSurf } = calculateUnitValue(unit, unitSurfaces);
    totalRevenue += unit.target_sale_price || calculatedValue;
    totalAdjustedSurface += adjSurf;
    unitsSummary.push({
      name: unit.name,
      floor: unit.floor,
      calculated_value: calculatedValue,
      target_price: unit.target_sale_price,
      adjusted_surface: adjSurf,
    });
  }

  // --- COSTI ACQUISIZIONE ---
  const totalAcquisitionCost = acquisitionCosts.reduce(
    (sum, cost) => sum + calculateAcquisitionAmount(cost),
    0
  );

  // --- COSTI OPERATIVI ---
  const totalOperationCost = operationCosts.reduce(
    (sum, cost) => sum + calculateOperationAmount(cost),
    0
  );

  const operationBySection = ['management', 'utilities', 'professionals', 'permits'].map(section => ({
    section,
    total: operationCosts
      .filter(c => c.section === section)
      .reduce((sum, cost) => sum + calculateOperationAmount(cost), 0),
  }));

  // --- COSTI COSTRUZIONE ---
  const measurementsByItem = new Map<string, Measurement[]>();
  for (const m of measurements) {
    const existing = measurementsByItem.get(m.item_id) || [];
    existing.push(m);
    measurementsByItem.set(m.item_id, existing);
  }

  let totalConstructionCost = 0;
  const floorTotals = new Map<string, { total: number; count: number }>();

  for (const item of constructionItems) {
    const itemMeasurements = measurementsByItem.get(item.id) || [];
    const itemTotal = calculateItemTotal(item, itemMeasurements);
    totalConstructionCost += itemTotal;

    const existing = floorTotals.get(item.floor) || { total: 0, count: 0 };
    existing.total += itemTotal;
    existing.count += 1;
    floorTotals.set(item.floor, existing);
  }

  const constructionByFloor = Array.from(floorTotals.entries()).map(([floor, data]) => ({
    floor,
    total: Math.round(data.total * 100) / 100,
    item_count: data.count,
  }));

  // --- TOTALI ---
  const totalCost = totalAcquisitionCost + totalOperationCost + totalConstructionCost;

  // --- MARGINI ---
  const grossMargin = totalRevenue - totalCost;
  const marginPercentage = totalCost > 0 ? (grossMargin / totalCost) * 100 : 0;
  const marginOnRevenue = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
  const roi = totalCost > 0 ? (grossMargin / totalCost) * 100 : 0;

  // --- INDICATORI ---
  const costPerSqm = totalAdjustedSurface > 0 ? totalCost / totalAdjustedSurface : 0;
  const revenuePerSqm = totalAdjustedSurface > 0 ? totalRevenue / totalAdjustedSurface : 0;
  const acquisitionIncidence = totalCost > 0 ? (totalAcquisitionCost / totalCost) * 100 : 0;
  const constructionIncidence = totalCost > 0 ? (totalConstructionCost / totalCost) * 100 : 0;
  const operationIncidence = totalCost > 0 ? (totalOperationCost / totalCost) * 100 : 0;

  return {
    total_revenue: Math.round(totalRevenue * 100) / 100,
    units_summary: unitsSummary,
    total_acquisition_cost: Math.round(totalAcquisitionCost * 100) / 100,
    total_operation_cost: Math.round(totalOperationCost * 100) / 100,
    total_construction_cost: Math.round(totalConstructionCost * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
    construction_by_floor: constructionByFloor,
    gross_margin: Math.round(grossMargin * 100) / 100,
    margin_percentage: Math.round(marginPercentage * 100) / 100,
    margin_on_revenue: Math.round(marginOnRevenue * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    cost_per_sqm: Math.round(costPerSqm * 100) / 100,
    revenue_per_sqm: Math.round(revenuePerSqm * 100) / 100,
    acquisition_incidence: Math.round(acquisitionIncidence * 100) / 100,
    construction_incidence: Math.round(constructionIncidence * 100) / 100,
    operation_incidence: Math.round(operationIncidence * 100) / 100,
    operation_cost_by_section: operationBySection.map(s => ({
      ...s,
      total: Math.round(s.total * 100) / 100,
    })),
  };
}
