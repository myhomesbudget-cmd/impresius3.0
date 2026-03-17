import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Project } from '@/types/database';
import {
  Plus,
  FolderOpen,
  FilePenLine,
  Crown,
  MapPin,
  Building2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const strategyLabels: Record<string, string> = {
  ristrutturazione: 'Ristrutturazione',
  frazionamento: 'Frazionamento',
  nuova_costruzione: 'Nuova Costruzione',
  rivendita: 'Rivendita',
};

const strategyColors: Record<string, string> = {
  ristrutturazione: 'bg-blue-50 text-blue-700 border border-blue-200',
  frazionamento: 'bg-purple-50 text-purple-700 border border-purple-200',
  nuova_costruzione: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rivendita: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const statusLabels: Record<string, string> = {
  draft: 'Bozza',
  active: 'Attivo',
  archived: 'Archiviato',
};

const statusColors: Record<string, string> = {
  draft: 'bg-slate-50 text-slate-600 border border-slate-200',
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  archived: 'bg-red-50 text-red-600 border border-red-200',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, subscription_plan')
    .eq('id', user.id)
    .single();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const allProjects = (projects || []) as Project[];
  const totalProjects = allProjects.length;
  const draftProjects = allProjects.filter((p) => p.status === 'draft').length;
  const activeProjects = allProjects.filter((p) => p.status === 'active').length;
  const isPremium = profile?.subscription_plan === 'premium';

  const greeting = profile?.full_name
    ? `Bentornato, ${profile.full_name}`
    : 'Benvenuto';

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <h1 className="page-header-title">Dashboard</h1>
          <p className="page-header-subtitle">{greeting}</p>
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
              <div className="icon-container icon-container-md rounded-xl bg-blue-50">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="metric-value text-slate-900">{totalProjects}</p>
            <p className="metric-sublabel">{activeProjects} attiv{activeProjects === 1 ? 'a' : 'e'}</p>
          </div>
        </div>

        {/* In Bozza */}
        <div className="kpi-card kpi-card-amber">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="metric-label">In Bozza</span>
              <div className="icon-container icon-container-md rounded-xl bg-amber-50">
                <FilePenLine className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="metric-value text-slate-900">{draftProjects}</p>
            <p className="metric-sublabel">Da completare</p>
          </div>
        </div>

        {/* Piano */}
        <div className="kpi-card kpi-card-indigo">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="metric-label">Piano Attivo</span>
              <div className="icon-container icon-container-md rounded-xl bg-indigo-50">
                <Crown className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            {isPremium ? (
              <>
                <p className="metric-value text-gradient-gold">Premium</p>
                <p className="metric-sublabel">Operazioni illimitate</p>
              </>
            ) : (
              <>
                <p className="metric-value text-slate-900">Free</p>
                <div className="mt-1">
                  <span className="badge-premium bg-amber-50 text-amber-700 border border-amber-200">
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
          <div className="icon-container icon-container-sm rounded-lg bg-slate-100">
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <h2 className="section-header-title">Le tue Operazioni</h2>
        </div>

        {allProjects.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 hover:shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="empty-state-icon">
                <Building2 className="w-9 h-9 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Nessuna operazione
              </h3>
              <p className="text-sm text-slate-500 mb-8 text-center max-w-sm leading-relaxed">
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
            {allProjects.map((project) => (
              <Link
                key={project.id}
                href={`/plans/${project.id}`}
                className="block group"
              >
                <Card className="h-full cursor-pointer hover:border-blue-200 group-hover:shadow-[0_0_0_1px_rgb(59_130_246/0.1),0_8px_20px_rgb(0_0_0/0.06)]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="icon-container icon-container-sm rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                          <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 line-clamp-1">
                          {project.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        {project.is_free_plan && (
                          <span className="badge-premium bg-slate-50 text-slate-600 border border-slate-200">
                            Free
                          </span>
                        )}
                        <span
                          className={`badge-premium ${statusColors[project.status] || 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                        >
                          {statusLabels[project.status] || project.status}
                        </span>
                      </div>
                    </div>

                    {(project.location_city || project.location_province) && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {[project.location_city, project.location_province]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <span
                        className={`badge-premium ${strategyColors[project.strategy] || 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                      >
                        {strategyLabels[project.strategy] || project.strategy}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
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
