import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const strategyLabels: Record<string, string> = {
  ristrutturazione: 'Ristrutturazione',
  frazionamento: 'Frazionamento',
  nuova_costruzione: 'Nuova Costruzione',
  rivendita: 'Rivendita',
};

const strategyColors: Record<string, { bg: string; text: string }> = {
  ristrutturazione: { bg: 'bg-blue-50 text-blue-700', text: 'border-blue-200' },
  frazionamento: { bg: 'bg-violet-50 text-violet-700', text: 'border-violet-200' },
  nuova_costruzione: { bg: 'bg-emerald-50 text-emerald-700', text: 'border-emerald-200' },
  rivendita: { bg: 'bg-amber-50 text-amber-700', text: 'border-amber-200' },
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: 'Bozza', color: 'text-amber-600', dot: 'bg-amber-500' },
  active: { label: 'Attivo', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  archived: { label: 'Archiviato', color: 'text-slate-500', dot: 'bg-slate-400' },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const summary = await getDashboardSummaryUseCase(supabase, user.id);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">{summary.greeting}</p>
        </div>
        <Link
          href="/plans/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Nuova Operazione
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {/* Operazioni Totali */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operazioni</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{summary.totalProjects}</p>
          <p className="text-slate-400 text-xs font-medium mt-1">{summary.activeProjects} attive</p>
        </div>

        {/* In Bozza */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">In Bozza</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-100">
              <FilePenLine className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{summary.draftProjects}</p>
          <p className="text-slate-400 text-xs font-medium mt-1">Da completare</p>
        </div>

        {/* Piano */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Piano Attivo</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100">
              <Crown className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          {summary.isPremium ? (
            <>
              <p className="text-4xl font-extrabold tracking-tight text-gradient">Premium</p>
              <p className="text-slate-400 text-xs font-medium mt-1">Operazioni illimitate</p>
            </>
          ) : (
            <>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">Free</p>
              <Link href="/payments" className="inline-flex items-center gap-1 text-blue-600 text-xs font-bold mt-1 hover:text-blue-700 transition-colors">
                <Crown className="w-3 h-3" /> Passa a Premium
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-100">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Le tue Operazioni</h2>
        </div>

        {summary.projects.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-blue-200 py-20 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center bg-blue-600 shadow-lg shadow-blue-600/20">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Inizia il tuo primo progetto</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">
                Scopri in pochi minuti se la tua operazione è profittevole. ROI, margini e sintesi professionale in un click.
              </p>
              <Link
                href="/plans/new"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Crea Nuova Operazione
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {summary.projects.map((project: Project) => {
              const status = statusConfig[project.status] ?? statusConfig.draft;
              const stratColor = strategyColors[project.strategy] ?? { bg: 'bg-slate-50 text-slate-700', text: 'border-slate-200' };

              return (
                <Link key={project.id} href={`/plans/${project.id}`} className="block group">
                  <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                    {/* Top accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400" />

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 flex-1 mr-2 group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-[0.65rem] font-bold ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      {/* Location */}
                      {(project.location_city || project.location_province) && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                          <MapPin className="w-3 h-3" />
                          {[project.location_city, project.location_province].filter(Boolean).join(', ')}
                        </div>
                      )}

                      {/* Strategy badge + date */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[0.65rem] font-bold ${stratColor.bg} border ${stratColor.text}`}>
                          {strategyLabels[project.strategy] ?? project.strategy}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <TrendingUp className="w-3 h-3" />
                          {formatDate(project.created_at)}
                        </div>
                      </div>

                      {/* CTA arrow */}
                      <div className="flex items-center justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[0.65rem] text-blue-600 font-semibold flex items-center gap-1">
                          Apri operazione <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
