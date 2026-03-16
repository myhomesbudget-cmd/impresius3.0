// =============================================
// Custom hooks per la gestione dei dati operazione
// =============================================

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook per il salvataggio automatico con debounce
 */
export function useAutoSave<T>(
  saveFn: (data: T) => Promise<void>,
  delay: number = 1000
) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (data: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await saveFn(data);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setSaving(false);
        }
      }, delay);
    },
    [saveFn, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { save, saving, lastSaved };
}

/**
 * Hook per generare ID temporanei client-side
 */
export function useTempId(): () => string {
  const counterRef = useRef(0);
  return useCallback(() => {
    counterRef.current += 1;
    return `temp-${Date.now()}-${counterRef.current}`;
  }, []);
}
