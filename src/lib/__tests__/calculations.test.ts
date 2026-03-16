import { describe, it, expect } from 'vitest';
import {
  calculateMeasurementQuantity,
  calculateItemQuantity,
  calculateItemTotal,
  calculateAdjustedSurface,
  calculateSurfaceValue,
  calculateUnitValue,
  calculateAcquisitionAmount,
  calculateOperationAmount,
  calculateProjectResults,
} from '../calculations';
import type {
  Measurement,
  ConstructionItem,
  UnitSurface,
  PropertyUnit,
  AcquisitionCost,
  OperationCost,
} from '@/types/database';

// =============================================
// Helpers per creare fixture
// =============================================

function makeMeasurement(overrides: Partial<Measurement> = {}): Measurement {
  return {
    id: 'meas-1',
    item_id: 'item-1',
    description: null,
    parts: 0,
    length: 0,
    width: 0,
    height_weight: 0,
    sort_order: 0,
    ...overrides,
  };
}

function makeItem(overrides: Partial<ConstructionItem> = {}): ConstructionItem {
  return {
    id: 'item-1',
    project_id: 'proj-1',
    floor: 'PT',
    item_number: 1,
    code: null,
    category: 'demolitions',
    title: 'Test Item',
    description: null,
    unit_of_measure: 'mq',
    unit_price: 10,
    sort_order: 0,
    created_at: '2024-01-01',
    ...overrides,
  };
}

function makeSurface(overrides: Partial<UnitSurface> = {}): UnitSurface {
  return {
    id: 'surf-1',
    unit_id: 'unit-1',
    surface_type: 'appartamento',
    gross_surface: 100,
    coefficient: 1.0,
    unit_price: null,
    floor_reference: null,
    sort_order: 0,
    ...overrides,
  };
}

function makeUnit(overrides: Partial<PropertyUnit> = {}): PropertyUnit {
  return {
    id: 'unit-1',
    project_id: 'proj-1',
    name: 'App. PT',
    floor: 'PT',
    destination: 'Appartamento',
    market_price_sqm: 2000,
    target_sale_price: 300000,
    sort_order: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    ...overrides,
  };
}

function makeAcquisitionCost(overrides: Partial<AcquisitionCost> = {}): AcquisitionCost {
  return {
    id: 'acq-1',
    project_id: 'proj-1',
    category: 'purchase_price',
    label: 'Prezzo Acquisto',
    calculation_type: 'fixed',
    base_value: 0,
    percentage: 0,
    fixed_amount: 100000,
    sort_order: 0,
    ...overrides,
  };
}

function makeOperationCost(overrides: Partial<OperationCost> = {}): OperationCost {
  return {
    id: 'op-1',
    project_id: 'proj-1',
    section: 'management',
    category: 'management_fee',
    label: 'Gestione',
    calculation_type: 'fixed',
    base_value: 0,
    percentage: 0,
    unit_price: 5000,
    quantity: 1,
    quantity_unit: null,
    sort_order: 0,
    ...overrides,
  };
}

// =============================================
// Tests: calculateMeasurementQuantity
// =============================================

describe('calculateMeasurementQuantity', () => {
  it('returns 0 when all fields are 0', () => {
    const m = makeMeasurement();
    expect(calculateMeasurementQuantity(m)).toBe(0);
  });

  it('returns parts when only parts > 0', () => {
    const m = makeMeasurement({ parts: 5 });
    expect(calculateMeasurementQuantity(m)).toBe(5);
  });

  it('multiplies parts × length', () => {
    const m = makeMeasurement({ parts: 2, length: 3 });
    expect(calculateMeasurementQuantity(m)).toBe(6);
  });

  it('multiplies parts × length × width', () => {
    const m = makeMeasurement({ parts: 2, length: 3, width: 4 });
    expect(calculateMeasurementQuantity(m)).toBe(24);
  });

  it('multiplies all four fields', () => {
    const m = makeMeasurement({ parts: 2, length: 3, width: 4, height_weight: 5 });
    expect(calculateMeasurementQuantity(m)).toBe(120);
  });

  it('skips zero fields in multiplication', () => {
    const m = makeMeasurement({ parts: 0, length: 3, width: 0, height_weight: 2 });
    expect(calculateMeasurementQuantity(m)).toBe(6);
  });

  it('handles single non-zero dimension (length only)', () => {
    const m = makeMeasurement({ length: 7.5 });
    expect(calculateMeasurementQuantity(m)).toBe(7.5);
  });
});

// =============================================
// Tests: calculateItemQuantity
// =============================================

describe('calculateItemQuantity', () => {
  it('returns 0 for empty measurements', () => {
    expect(calculateItemQuantity([])).toBe(0);
  });

  it('sums multiple measurements', () => {
    const measurements = [
      makeMeasurement({ parts: 2, length: 3 }),
      makeMeasurement({ parts: 1, length: 5 }),
    ];
    expect(calculateItemQuantity(measurements)).toBe(11); // 6 + 5
  });
});

// =============================================
// Tests: calculateItemTotal
// =============================================

describe('calculateItemTotal', () => {
  it('returns quantity × unit_price', () => {
    const item = makeItem({ unit_price: 25 });
    const measurements = [makeMeasurement({ parts: 2, length: 3 })]; // qty = 6
    expect(calculateItemTotal(item, measurements)).toBe(150);
  });

  it('returns 0 for empty measurements', () => {
    const item = makeItem({ unit_price: 25 });
    expect(calculateItemTotal(item, [])).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    const item = makeItem({ unit_price: 3.33 });
    const measurements = [makeMeasurement({ parts: 3 })]; // qty = 3
    expect(calculateItemTotal(item, measurements)).toBe(9.99);
  });
});

// =============================================
// Tests: calculateAdjustedSurface
// =============================================

describe('calculateAdjustedSurface', () => {
  it('returns gross × coefficient', () => {
    const surface = makeSurface({ gross_surface: 100, coefficient: 0.25 });
    expect(calculateAdjustedSurface(surface)).toBe(25);
  });

  it('returns full surface with coefficient 1.0', () => {
    const surface = makeSurface({ gross_surface: 131.2, coefficient: 1.0 });
    expect(calculateAdjustedSurface(surface)).toBe(131.2);
  });

  it('handles small coefficients', () => {
    const surface = makeSurface({ gross_surface: 200, coefficient: 0.03 });
    expect(calculateAdjustedSurface(surface)).toBe(6);
  });
});

// =============================================
// Tests: calculateSurfaceValue
// =============================================

describe('calculateSurfaceValue', () => {
  it('uses unit_price when set', () => {
    const surface = makeSurface({ gross_surface: 100, coefficient: 1.0, unit_price: 2500 });
    expect(calculateSurfaceValue(surface, 2000)).toBe(250000);
  });

  it('falls back to marketPriceSqm when unit_price is null', () => {
    const surface = makeSurface({ gross_surface: 100, coefficient: 1.0, unit_price: null });
    expect(calculateSurfaceValue(surface, 2000)).toBe(200000);
  });

  it('applies coefficient correctly', () => {
    const surface = makeSurface({ gross_surface: 50, coefficient: 0.25, unit_price: null });
    expect(calculateSurfaceValue(surface, 2000)).toBe(25000); // 12.5 sqm × 2000
  });
});

// =============================================
// Tests: calculateUnitValue
// =============================================

describe('calculateUnitValue', () => {
  it('sums all surfaces for a unit', () => {
    const unit = makeUnit({ market_price_sqm: 2000 });
    const surfaces = [
      makeSurface({ gross_surface: 100, coefficient: 1.0, unit_price: null }),
      makeSurface({ id: 'surf-2', gross_surface: 20, coefficient: 0.25, unit_price: null }),
    ];
    const result = calculateUnitValue(unit, surfaces);
    expect(result.totalAdjustedSurface).toBe(105); // 100 + 5
    expect(result.calculatedValue).toBe(210000); // 100×2000 + 5×2000
  });

  it('returns 0 for no surfaces', () => {
    const unit = makeUnit();
    const result = calculateUnitValue(unit, []);
    expect(result.calculatedValue).toBe(0);
    expect(result.totalAdjustedSurface).toBe(0);
  });
});

// =============================================
// Tests: calculateAcquisitionAmount
// =============================================

describe('calculateAcquisitionAmount', () => {
  it('returns fixed_amount for fixed type', () => {
    const cost = makeAcquisitionCost({ calculation_type: 'fixed', fixed_amount: 195000 });
    expect(calculateAcquisitionAmount(cost)).toBe(195000);
  });

  it('calculates percentage-based amount', () => {
    const cost = makeAcquisitionCost({
      calculation_type: 'percentage',
      base_value: 195000,
      percentage: 6,
    });
    expect(calculateAcquisitionAmount(cost)).toBe(11700);
  });

  it('handles fractional percentages', () => {
    const cost = makeAcquisitionCost({
      calculation_type: 'percentage',
      base_value: 195000,
      percentage: 1.5,
    });
    expect(calculateAcquisitionAmount(cost)).toBe(2925);
  });
});

// =============================================
// Tests: calculateOperationAmount
// =============================================

describe('calculateOperationAmount', () => {
  it('returns unit_price for fixed type', () => {
    const cost = makeOperationCost({ calculation_type: 'fixed', unit_price: 3000 });
    expect(calculateOperationAmount(cost)).toBe(3000);
  });

  it('calculates percentage-based amount', () => {
    const cost = makeOperationCost({
      calculation_type: 'percentage',
      base_value: 100000,
      percentage: 1.0,
    });
    expect(calculateOperationAmount(cost)).toBe(1000);
  });

  it('calculates unit × quantity', () => {
    const cost = makeOperationCost({
      calculation_type: 'unit_quantity',
      unit_price: 250,
      quantity: 3,
    });
    expect(calculateOperationAmount(cost)).toBe(750);
  });

  it('returns 0 for fixed with no unit_price', () => {
    const cost = makeOperationCost({ calculation_type: 'fixed', unit_price: 0 });
    expect(calculateOperationAmount(cost)).toBe(0);
  });
});

// =============================================
// Tests: calculateProjectResults (integrazione)
// =============================================

describe('calculateProjectResults', () => {
  it('calculates a complete project correctly', () => {
    const units = [
      makeUnit({ id: 'u1', target_sale_price: 310000, market_price_sqm: 2000 }),
      makeUnit({ id: 'u2', name: 'App. P1', floor: 'P1', target_sale_price: 280000, market_price_sqm: 2100 }),
    ];

    const surfaces = [
      makeSurface({ unit_id: 'u1', gross_surface: 120, coefficient: 1.0, unit_price: null }),
      makeSurface({ id: 's2', unit_id: 'u1', gross_surface: 15, coefficient: 0.25, unit_price: null }),
      makeSurface({ id: 's3', unit_id: 'u2', gross_surface: 95, coefficient: 1.0, unit_price: null }),
    ];

    const acquisitionCosts = [
      makeAcquisitionCost({ fixed_amount: 195000 }),
      makeAcquisitionCost({ id: 'acq-2', calculation_type: 'percentage', base_value: 195000, percentage: 11 }),
    ];

    const operationCosts = [
      makeOperationCost({ unit_price: 5000 }),
      makeOperationCost({ id: 'op-2', section: 'professionals', category: 'design', calculation_type: 'unit_quantity', unit_price: 7500, quantity: 1 }),
    ];

    const constructionItems = [
      makeItem({ id: 'ci1', floor: 'PT', unit_price: 50 }),
      makeItem({ id: 'ci2', floor: 'P1', unit_price: 30 }),
    ];

    const measurements = [
      makeMeasurement({ item_id: 'ci1', parts: 10, length: 3, width: 2 }),
      makeMeasurement({ item_id: 'ci2', parts: 5, length: 4 }),
    ];

    const result = calculateProjectResults(
      units, surfaces, acquisitionCosts, operationCosts,
      constructionItems, measurements,
    );

    // Ricavi: 310000 + 280000 = 590000
    expect(result.total_revenue).toBe(590000);

    // Acquisizione: 195000 + (195000 * 11/100) = 195000 + 21450 = 216450
    expect(result.total_acquisition_cost).toBe(216450);

    // Operativi: 5000 + 7500 = 12500
    expect(result.total_operation_cost).toBe(12500);

    // Costruzione PT: 10×3×2 = 60 × 50 = 3000 | P1: 5×4 = 20 × 30 = 600 -> tot 3600
    expect(result.total_construction_cost).toBe(3600);

    // Totale costi: 216450 + 12500 + 3600 = 232550
    expect(result.total_cost).toBe(232550);

    // Margine: 590000 - 232550 = 357450
    expect(result.gross_margin).toBe(357450);

    // Margine %: (357450 / 232550) * 100 ≈ 153.71
    expect(result.margin_percentage).toBeCloseTo(153.71, 0);

    // ROI = margin_percentage
    expect(result.roi).toBe(result.margin_percentage);

    // Construction by floor
    expect(result.construction_by_floor).toHaveLength(2);

    // Units summary
    expect(result.units_summary).toHaveLength(2);
    expect(result.units_summary[0].name).toBe('App. PT');

    // Incidenze sommano a ~100%
    const totalIncidence = result.acquisition_incidence + result.construction_incidence + result.operation_incidence;
    expect(totalIncidence).toBeCloseTo(100, 0);

    // Operation by section
    expect(result.operation_cost_by_section).toHaveLength(4);
  });

  it('handles empty project gracefully', () => {
    const result = calculateProjectResults([], [], [], [], [], []);

    expect(result.total_revenue).toBe(0);
    expect(result.total_cost).toBe(0);
    expect(result.gross_margin).toBe(0);
    expect(result.roi).toBe(0);
    expect(result.margin_percentage).toBe(0);
    expect(result.cost_per_sqm).toBe(0);
    expect(result.revenue_per_sqm).toBe(0);
  });

  it('uses calculated_value when target_sale_price is 0', () => {
    const units = [makeUnit({ target_sale_price: 0, market_price_sqm: 2000 })];
    const surfaces = [makeSurface({ unit_id: 'unit-1', gross_surface: 100, coefficient: 1.0 })];

    const result = calculateProjectResults(units, surfaces, [], [], [], []);

    // target_sale_price is 0 (falsy) → uses calculatedValue = 100 × 2000 = 200000
    expect(result.total_revenue).toBe(200000);
  });
});
