// =============================================
// Use Case: Project Report / Summary
// =============================================
//
// Carica tutti i dati di un progetto e calcola i risultati
// usando il motore canonico. Questo e il SOLO punto di ingresso
// per i calcoli KPI — nessuna pagina deve ricalcolare in proprio.
//

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project, ProjectResults } from '@/types/database';
import { calculateProjectResults } from '@/lib/calculations';
import { getProjectById } from '@/repositories/projects';
import { loadProjectDataset, type ProjectDataset } from '@/repositories/project-data';

export interface ProjectReport {
  project: Project;
  dataset: ProjectDataset;
  results: ProjectResults;
}

/**
 * Carica i dati completi di un progetto e calcola i KPI
 * tramite il motore canonico di calcolo.
 *
 * Usato da: summary, report, scenarios, compare, monitoring.
 */
export async function getProjectReportUseCase(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ProjectReport> {
  const [project, dataset] = await Promise.all([
    getProjectById(supabase, projectId),
    loadProjectDataset(supabase, projectId),
  ]);

  const results = calculateProjectResults(
    dataset.units,
    dataset.surfaces,
    dataset.acquisitionCosts,
    dataset.operationCosts,
    dataset.constructionItems,
    dataset.measurements,
  );

  return { project, dataset, results };
}
