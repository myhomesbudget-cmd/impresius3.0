// =============================================
// Use Case: Create Project
// =============================================
//
// Flusso transazionale di creazione operazione:
// 1. Valida sessione utente
// 2. Legge profilo e verifica diritti
// 3. Determina canale: premium | free | credito singolo
// 4. Crea il progetto
// 5. Aggiorna coerentemente lo stato piano/credito
// 6. Restituisce esito univoco
//
// In caso di fallimento a qualunque step dopo la creazione
// del progetto, il progetto viene rimosso (compensazione).
//

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project } from '@/types/database';
import {
  AuthenticationError,
  ProjectLimitError,
  ValidationError,
  DatabaseError,
  logger,
} from '@/domain/errors';
import {
  getProfileCreationRights,
  markFreePlanUsed,
} from '@/repositories/profiles';
import {
  countAvailableCredits,
  consumeOldestCredit,
} from '@/repositories/payments';
import {
  createProject as repoCreateProject,
  deleteProject,
  type CreateProjectInput,
} from '@/repositories/projects';

/** Canale di accesso determinato dal profilo */
export type AccessChannel = 'premium' | 'free' | 'credit';

export interface CreateProjectRequest {
  name: string;
  locationCity?: string;
  locationProvince?: string;
  strategy: string;
}

export interface CreateProjectResult {
  project: Project;
  accessChannel: AccessChannel;
}

/**
 * Esegue la creazione dell'operazione con garanzia di coerenza.
 * Se il consumo del credito/free plan fallisce, il progetto creato
 * viene compensato (eliminato).
 */
export async function createProjectUseCase(
  supabase: SupabaseClient,
  userId: string | undefined,
  request: CreateProjectRequest,
): Promise<CreateProjectResult> {
  const correlationId = crypto.randomUUID();

  // 1. Validate session
  if (!userId) {
    throw new AuthenticationError();
  }

  // 2. Validate input
  const trimmedName = request.name?.trim();
  if (!trimmedName) {
    throw new ValidationError(
      'Project name is required',
      "Il nome dell'operazione e obbligatorio.",
    );
  }

  const validStrategies = ['ristrutturazione', 'frazionamento', 'nuova_costruzione', 'rivendita'];
  const strategy = validStrategies.includes(request.strategy) ? request.strategy : 'ristrutturazione';

  logger.info('Create project: checking rights', {
    correlationId,
    userId,
    operation: 'createProject',
  });

  // 3. Read profile and determine access channel
  const profile = await getProfileCreationRights(supabase, userId);
  let accessChannel: AccessChannel;
  let isFreePlan = false;

  if (profile.subscriptionPlan === 'premium') {
    accessChannel = 'premium';
  } else if (!profile.freePlanUsed) {
    accessChannel = 'free';
    isFreePlan = true;
  } else {
    const credits = await countAvailableCredits(supabase, userId);
    if (credits > 0) {
      accessChannel = 'credit';
    } else {
      throw new ProjectLimitError({ userId, correlationId });
    }
  }

  logger.info(`Create project: channel=${accessChannel}`, {
    correlationId,
    userId,
    operation: 'createProject',
    accessChannel,
  });

  // 4. Create the project
  const projectInput: CreateProjectInput = {
    userId,
    name: trimmedName,
    locationCity: request.locationCity?.trim() || null,
    locationProvince: request.locationProvince?.trim() || null,
    propertyType: 'residenziale',
    strategy: strategy as Project['strategy'],
    isFreePlan,
  };

  const project = await repoCreateProject(supabase, projectInput);

  // 5. Consume access right with compensation on failure
  try {
    if (accessChannel === 'free') {
      await markFreePlanUsed(supabase, userId);
    } else if (accessChannel === 'credit') {
      await consumeOldestCredit(supabase, userId, project.id);
    }
    // premium: nothing to consume
  } catch (err) {
    // Compensation: remove the created project to avoid inconsistent state
    logger.error('Create project: access consumption failed, compensating', {
      correlationId,
      userId,
      operation: 'createProject',
      projectId: project.id,
      accessChannel,
      error: err,
    });

    try {
      await deleteProject(supabase, project.id);
    } catch (deleteErr) {
      // Log but don't mask the original error
      logger.error('Create project: compensation (delete) also failed', {
        correlationId,
        userId,
        operation: 'createProject.compensate',
        projectId: project.id,
        error: deleteErr,
      });
    }

    if (err instanceof DatabaseError) throw err;
    throw new DatabaseError('consumeAccessRight', err);
  }

  logger.info('Create project: success', {
    correlationId,
    userId,
    operation: 'createProject',
    projectId: project.id,
    accessChannel,
  });

  return { project, accessChannel };
}
