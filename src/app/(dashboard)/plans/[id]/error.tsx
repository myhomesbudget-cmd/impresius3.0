'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function PlanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Plan error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 md:p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Errore nel caricamento dell&apos;operazione
        </h2>
        <p className="mb-6 text-muted-foreground">
          Non è stato possibile caricare i dati dell&apos;operazione.
          Verifica che il link sia corretto e riprova.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Riprova
          </button>
          <Link
            href="/plans"
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            Torna alle Operazioni
          </Link>
        </div>
      </div>
    </div>
  );
}
