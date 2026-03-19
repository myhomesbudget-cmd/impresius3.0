'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2 } from 'lucide-react';

interface ProjectCompletionBadgesProps {
  projectId: string;
}

interface Completion {
  acquisition: boolean;
  construction: boolean;
  valuation: boolean;
  summary: boolean;
}

export function ProjectCompletionBadges({ projectId }: ProjectCompletionBadgesProps) {
  const [completion, setCompletion] = useState<Completion | null>(null);

  useEffect(() => {
    async function check() {
      const supabase = createClient();

      const [
        { data: acquisition },
        { data: construction },
        { data: units },
      ] = await Promise.all([
        supabase.from('acquisition_costs').select('id').eq('project_id', projectId).limit(1),
        supabase.from('construction_items').select('id').eq('project_id', projectId).limit(1),
        supabase.from('property_units').select('id').eq('project_id', projectId).limit(1),
      ]);

      const hasAcquisition = (acquisition?.length ?? 0) > 0;
      const hasConstruction = (construction?.length ?? 0) > 0;
      const hasValuation = (units?.length ?? 0) > 0;
      const hasSummary = hasAcquisition && hasConstruction && hasValuation;

      setCompletion({
        acquisition: hasAcquisition,
        construction: hasConstruction,
        valuation: hasValuation,
        summary: hasSummary,
      });
    }
    check();
  }, [projectId]);

  if (!completion) return null;

  return completion;
}

export function getCompletionForPath(
  path: string,
  completion: Completion,
): boolean {
  if (path.includes('/acquisition')) return completion.acquisition;
  if (path.includes('/construction')) return completion.construction;
  if (path.includes('/valuation')) return completion.valuation;
  if (path.includes('/summary')) return completion.summary;
  return false;
}

export function CompletionDot({ done }: { done: boolean }) {
  if (!done) return null;
  return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto flex-shrink-0" />;
}
