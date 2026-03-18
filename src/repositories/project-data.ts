// =============================================
// Repository: Project Data (units, surfaces, costs, items, measurements)
// =============================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  PropertyUnit,
  UnitSurface,
  AcquisitionCost,
  OperationCost,
  ConstructionItem,
  Measurement,
  ActualCost,
} from '@/types/database';
import { DatabaseError } from '@/domain/errors';

/**
 * Tutto il dataset necessario per calcolare i risultati di un progetto.
 * Caricato in parallelo per efficienza.
 */
export interface ProjectDataset {
  units: PropertyUnit[];
  surfaces: UnitSurface[];
  acquisitionCosts: AcquisitionCost[];
  operationCosts: OperationCost[];
  constructionItems: ConstructionItem[];
  measurements: Measurement[];
}

export interface ProjectDatasetWithActuals extends ProjectDataset {
  actualCosts: ActualCost[];
}

/**
 * Carica tutti i dati di un progetto necessari al calcolo dei KPI.
 * Filtra client-side le superfici e le misurazioni per pertinenza.
 */
export async function loadProjectDataset(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ProjectDataset> {
  const [
    { data: units, error: e1 },
    { data: surfaces, error: e2 },
    { data: acquisitionCosts, error: e3 },
    { data: operationCosts, error: e4 },
    { data: constructionItems, error: e5 },
    { data: measurements, error: e6 },
  ] = await Promise.all([
    supabase.from('property_units').select('*').eq('project_id', projectId).order('sort_order'),
    supabase.from('unit_surfaces').select('*').order('sort_order'),
    supabase.from('acquisition_costs').select('*').eq('project_id', projectId).order('sort_order'),
    supabase.from('operation_costs').select('*').eq('project_id', projectId).order('sort_order'),
    supabase.from('construction_items').select('*').eq('project_id', projectId).order('sort_order'),
    supabase.from('measurements').select('*').order('sort_order'),
  ]);

  const firstError = e1 || e2 || e3 || e4 || e5 || e6;
  if (firstError) throw new DatabaseError('loadProjectDataset', firstError);

  const typedUnits = (units || []) as PropertyUnit[];
  const typedItems = (constructionItems || []) as ConstructionItem[];

  // Filter surfaces and measurements to only those belonging to this project
  const unitIds = new Set(typedUnits.map(u => u.id));
  const itemIds = new Set(typedItems.map(i => i.id));

  return {
    units: typedUnits,
    surfaces: ((surfaces || []) as UnitSurface[]).filter(s => unitIds.has(s.unit_id)),
    acquisitionCosts: (acquisitionCosts || []) as AcquisitionCost[],
    operationCosts: (operationCosts || []) as OperationCost[],
    constructionItems: typedItems,
    measurements: ((measurements || []) as Measurement[]).filter(m => itemIds.has(m.item_id)),
  };
}

/**
 * Carica il dataset completo inclusi i costi effettivi per il monitoring.
 */
export async function loadProjectDatasetWithActuals(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ProjectDatasetWithActuals> {
  const [dataset, { data: actualCosts, error }] = await Promise.all([
    loadProjectDataset(supabase, projectId),
    supabase.from('actual_costs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
  ]);

  if (error) throw new DatabaseError('loadActualCosts', error);

  return {
    ...dataset,
    actualCosts: (actualCosts || []) as ActualCost[],
  };
}
