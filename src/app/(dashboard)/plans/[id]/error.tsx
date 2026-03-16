'use client';

import { useEffect } from 'react';
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
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Errore nel caricamento dell&apos;operazione
        </h2>
        <p className="mb-6 text-gray-600">
          Non è stato possibile caricare i dati dell&apos;operazione.
          Verifica che il link sia corretto e riprova.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Riprova
          </button>
          <a
            href="/plans"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Torna alle Operazioni
          </a>
        </div>
      </div>
    </div>
  );
}
