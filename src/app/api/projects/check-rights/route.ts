import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkCreationRightsUseCase } from '@/services/check-creation-rights';
import { AppError, logger } from '@/domain/errors';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const rights = await checkCreationRightsUseCase(supabase, user.id);

    return NextResponse.json(rights);
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.userMessage, code: err.code },
        { status: err.statusCode },
      );
    }

    logger.error('Unhandled error in GET /api/projects/check-rights', {
      operation: 'api.projects.checkRights',
      error: err,
    });

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 },
    );
  }
}
