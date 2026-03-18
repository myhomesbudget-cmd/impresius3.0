// =============================================
// IMPRESIUS 3.0 - Application Error Taxonomy
// =============================================

/**
 * Errore applicativo base. Distingue errori di business (attesi)
 * da errori di sistema (inattesi).
 */
export class AppError extends Error {
  /** Codice stabile per il client (es. 'PROJECT_LIMIT_REACHED') */
  readonly code: string;
  /** HTTP status code suggerito */
  readonly statusCode: number;
  /** Messaggio per l'utente finale (localizzato) */
  readonly userMessage: string;
  /** Contesto aggiuntivo per il logging */
  readonly context?: Record<string, unknown>;

  constructor(opts: {
    code: string;
    message: string;
    userMessage: string;
    statusCode?: number;
    context?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super(opts.message, { cause: opts.cause });
    this.name = 'AppError';
    this.code = opts.code;
    this.statusCode = opts.statusCode ?? 500;
    this.userMessage = opts.userMessage;
    this.context = opts.context;
  }
}

// --- Business errors (attesi, 4xx) ---

export class AuthenticationError extends AppError {
  constructor(context?: Record<string, unknown>) {
    super({
      code: 'NOT_AUTHENTICATED',
      message: 'User is not authenticated',
      userMessage: 'Sessione scaduta. Effettua nuovamente il login.',
      statusCode: 401,
      context,
    });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(reason: string, context?: Record<string, unknown>) {
    super({
      code: 'NOT_AUTHORIZED',
      message: `Authorization denied: ${reason}`,
      userMessage: 'Non hai i permessi per eseguire questa operazione.',
      statusCode: 403,
      context,
    });
    this.name = 'AuthorizationError';
  }
}

export class ProjectLimitError extends AppError {
  constructor(context?: Record<string, unknown>) {
    super({
      code: 'PROJECT_LIMIT_REACHED',
      message: 'User has no available project slots',
      userMessage: 'Hai esaurito i tuoi crediti. Acquista un nuovo accesso o passa a Premium.',
      statusCode: 403,
      context,
    });
    this.name = 'ProjectLimitError';
  }
}

export class CreditConsumedError extends AppError {
  constructor(context?: Record<string, unknown>) {
    super({
      code: 'CREDIT_ALREADY_CONSUMED',
      message: 'Credit was already consumed by concurrent operation',
      userMessage: 'Il credito e stato gia utilizzato. Riprova.',
      statusCode: 409,
      context,
    });
    this.name = 'CreditConsumedError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage?: string, context?: Record<string, unknown>) {
    super({
      code: 'VALIDATION_ERROR',
      message,
      userMessage: userMessage ?? message,
      statusCode: 400,
      context,
    });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super({
      code: 'NOT_FOUND',
      message: `${entity} not found${id ? `: ${id}` : ''}`,
      userMessage: `${entity} non trovato.`,
      statusCode: 404,
      context: { entity, id },
    });
    this.name = 'NotFoundError';
  }
}

export class PaymentError extends AppError {
  constructor(message: string, userMessage: string, context?: Record<string, unknown>) {
    super({
      code: 'PAYMENT_ERROR',
      message,
      userMessage,
      statusCode: 402,
      context,
    });
    this.name = 'PaymentError';
  }
}

export class IdempotencyConflictError extends AppError {
  constructor(entity: string, context?: Record<string, unknown>) {
    super({
      code: 'IDEMPOTENCY_CONFLICT',
      message: `Duplicate operation on ${entity}`,
      userMessage: 'Operazione gia elaborata.',
      statusCode: 200, // Return 200 for idempotent replays
      context,
    });
    this.name = 'IdempotencyConflictError';
  }
}

// --- System errors (inattesi, 5xx) ---

export class DatabaseError extends AppError {
  constructor(operation: string, cause?: unknown) {
    super({
      code: 'DATABASE_ERROR',
      message: `Database operation failed: ${operation}`,
      userMessage: 'Si e verificato un errore interno. Riprova tra qualche istante.',
      statusCode: 500,
      cause,
    });
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, cause?: unknown) {
    super({
      code: 'EXTERNAL_SERVICE_ERROR',
      message: `External service failure: ${service}`,
      userMessage: 'Servizio temporaneamente non disponibile. Riprova.',
      statusCode: 502,
      cause,
    });
    this.name = 'ExternalServiceError';
  }
}

// --- Logging helper ---

export interface LogContext {
  correlationId?: string;
  userId?: string;
  operation: string;
  [key: string]: unknown;
}

/** Structured server-side logger. */
export const logger = {
  info(message: string, ctx: LogContext) {
    console.log(JSON.stringify({ level: 'info', message, ...ctx, timestamp: new Date().toISOString() }));
  },
  warn(message: string, ctx: LogContext) {
    console.warn(JSON.stringify({ level: 'warn', message, ...ctx, timestamp: new Date().toISOString() }));
  },
  error(message: string, ctx: LogContext & { error?: unknown }) {
    const errDetail = ctx.error instanceof Error
      ? { errorMessage: ctx.error.message, errorStack: ctx.error.stack }
      : { errorMessage: String(ctx.error) };
    console.error(JSON.stringify({ level: 'error', message, ...ctx, ...errDetail, timestamp: new Date().toISOString() }));
  },
};
