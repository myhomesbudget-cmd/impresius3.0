import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createProjectUseCase } from '@/services/create-project';
import { AppError, logger } from '@/domain/errors';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { name, locationCity, locationProvince, strategy } = body as {
      name: string;
      locationCity?: string;
      locationProvince?: string;
      strategy: string;
    };

    const result = await createProjectUseCase(supabase, user?.id, {
      name,
      locationCity,
      locationProvince,
      strategy,
    });

    return NextResponse.json({
      project: result.project,
      accessChannel: result.accessChannel,
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.userMessage, code: err.code },
        { status: err.statusCode },
      );
    }

    logger.error('Unhandled error in POST /api/projects/create', {
      operation: 'api.projects.create',
      error: err,
    });

    return NextResponse.json(
      { error: 'Si e verificato un errore interno. Riprova.' },
      { status: 500 },
    );
  }
}
