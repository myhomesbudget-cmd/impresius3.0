import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/types/database';
import { getDashboardSummaryUseCase } from '@/services/dashboard-summary';
import {
  Plus,
  FolderOpen,
  FilePenLine,
  Crown,
  MapPin,
  Building2,
} from 'lucide-react';

const strategyLabels: Record<string, string> = {
  ristrutturazione: 'Ristrutturazione',
  frazionamento: 'Frazionamento',
  nuova_costruzione: 'Nuova Costruzione',
  rivendita: 'Rivendita',
};

const strategyColors: Record<string, string> = {
  ristrutturazione: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
  frazionamento: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
  nuova_costruzione: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  rivendita: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
};

const statusLabels: Record<string, string> = {
  draft: 'Bozza',
  active: 'Attivo',
  archived: 'Archiviato',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground border border-border',
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  archived: 'bg-destructive/10 text-destructive border border-destructive/20',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const summary = await getDashboardSummaryUseCase(supabase, user.id);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <h1 className="page-header-title">Dashboard</h1>
          <p className="page-header-subtitle">{summary.greeting}</p>
        </div>
        <Link href="/plans/new">
          <Button variant="gradient" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Nuova Operazione
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {/* Operazioni Totali */}
        <div className="kpi-card kpi-card-blue">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="metric-label">Operazioni Totali</span>
              <div className="icon-container icon-container-md rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
                <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="metric-value">{summary.totalProjects}</p>
            <p className="metric-sublabel">{summary.activeProjects} attiv{summary.activeProjects === 1 ? 'a' : 'e'}</p>
          </div>
        </div>

        {/* In Bozza */}
        <div className="kpi-card kpi-card-amber">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="metric-label">In Bozza</span>
              <div className="icon-container icon-container-md rounded-xl bg-amber-500/10 dark:bg-amber-500/20">
                <FilePenLine className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="metric-value">{summary.draftProjects}</p>
            <p className="metric-sublabel">Da completare</p>
          </div>
        </div>

        {/* Piano */}
        <div className="kpi-card kpi-card-indigo">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="metric-label">Piano Attivo</span>
              <div className="icon-container icon-container-md rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20">
                <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            {summary.isPremium ? (
              <>
                <p className="metric-value text-gradient-gold">Premium</p>
                <p className="metric-sublabel">Operazioni illimitate</p>
              </>
            ) : (
              <>
                <p className="metric-value">Free</p>
                <div className="mt-1">
                  <span className="badge-premium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <Crown className="w-3 h-3" />
                    Passa a Premium
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div>
        <div className="section-header">
          <div className="icon-container icon-container-sm rounded-lg bg-muted">
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <h2 className="section-header-title">Le tue Operazioni</h2>
        </div>

        {summary.projects.length === 0 ? (
          <Card className="border-dashed border-2 border-border bg-muted/50 hover:shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="empty-state-icon">
                <Building2 className="w-9 h-9 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Nessuna operazione
              </h3>
              <p className="text-sm text-muted-foreground mb-8 text-center max-w-sm leading-relaxed">
                Crea la tua prima operazione immobiliare per iniziare ad
                analizzare costi, ricavi e margini.
              </p>
              <Link href="/plans/new">
                <Button variant="gradient" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuova Operazione
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {summary.projects.map((project: Project) => (
              <Link
                key={project.id}
                href={`/plans/${project.id}`}
                className="block group"
              >
                <Card className="h-full cursor-pointer hover:border-primary/30 group-hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.1),0_8px_20px_hsl(var(--foreground)/0.06)]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="icon-container icon-container-sm rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                          <FolderOpen className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <h3 className="font-bold text-foreground line-clamp-1">
                          {project.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        {project.is_free_plan && (
                          <span className="badge-premium bg-muted text-muted-foreground border border-border">
                            Free
                          </span>
                        )}
                        <span
                          className={`badge-premium ${statusColors[project.status] || 'bg-muted text-muted-foreground border border-border'}`}
                        >
                          {statusLabels[project.status] || project.status}
                        </span>
                      </div>
                    </div>

                    {(project.location_city || project.location_province) && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {[project.location_city, project.location_province]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                      <span
                        className={`badge-premium ${strategyColors[project.strategy] || 'bg-muted text-muted-foreground border border-border'}`}
                      >
                        {strategyLabels[project.strategy] || project.strategy}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatDate(project.created_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
