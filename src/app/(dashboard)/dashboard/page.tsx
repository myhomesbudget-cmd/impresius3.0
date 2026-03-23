import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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

const strategyColors: Record<string, string> = {
  ristrutturazione: 'bg-[#7B61FF]/10 text-[#7B61FF] border-[#7B61FF]/20',
  frazionamento: 'bg-[#00C2FF]/10 text-[#00C2FF] border-[#00C2FF]/20',
  nuova_costruzione: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rivendita: 'bg-[#FF2D55]/10 text-[#FF2D55] border-[#FF2D55]/20',
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
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A24] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#1A1A24]/50 text-sm mt-1.5">{summary.greeting}</p>
        </div>
        <Link
          href="/plans/new"
          className="btn-glass-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuova Operazione
        </Link>
      </div>

      {/* KPI Stats — glass cards, NO nested backdrop-filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {/* Operazioni Totali */}
        <div className="glass-panel glass-accent-purple p-7">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold text-[#1A1A24]/40 uppercase tracking-widest">
              Operazioni
            </span>
            <div className="w-14 h-14 flex items-center justify-center">
              <Image
                src="/3d-folder.png"
                alt="Operazioni"
                width={56}
                height={56}
                className="object-contain hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          <p className="text-5xl font-extrabold text-[#1A1A24] tracking-tight">
            {summary.totalProjects}
          </p>
          <p className="text-[#1A1A24]/40 text-xs font-medium mt-1.5">
            {summary.activeProjects} attive
          </p>
        </div>

        {/* In Bozza */}
        <div className="glass-panel glass-accent-cyan p-7">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold text-[#1A1A24]/40 uppercase tracking-widest">
              In Bozza
            </span>
            <div className="w-14 h-14 flex items-center justify-center">
              <Image
                src="/3d-checklist.png"
                alt="In Bozza"
                width={56}
                height={56}
                className="object-contain hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          <p className="text-5xl font-extrabold text-[#1A1A24] tracking-tight">
            {summary.draftProjects}
          </p>
          <p className="text-[#1A1A24]/40 text-xs font-medium mt-1.5">Da completare</p>
        </div>

        {/* Piano */}
        <div className="glass-panel glass-accent-pink p-7">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold text-[#1A1A24]/40 uppercase tracking-widest">
              Piano Attivo
            </span>
            <div className="w-14 h-14 flex items-center justify-center">
              <Image
                src="/3d-crown.png"
                alt="Piano Attivo"
                width={56}
                height={56}
                className="object-contain hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          {summary.isPremium ? (
            <div>
              <p className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#7B61FF] to-[#00C2FF] bg-clip-text text-transparent">
                Premium
              </p>
              <p className="text-[#1A1A24]/40 text-xs font-medium mt-1.5">
                Operazioni illimitate
              </p>
            </div>
          ) : (
            <div>
              <p className="text-5xl font-extrabold text-[#1A1A24] tracking-tight">Free</p>
              <Link
                href="/payments"
                className="inline-flex items-center gap-1.5 text-[#7B61FF] text-xs font-bold mt-2 hover:text-[#6B51EF] transition-colors"
              >
                <Crown className="w-3.5 h-3.5" /> Passa a Premium
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center gap-3 mb-7">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7B61FF, #00C2FF)' }}
          >
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A24]">Le tue Operazioni</h2>
        </div>

        {summary.projects.length === 0 ? (
          <div className="glass-panel-lg py-20 text-center">
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-3xl mb-7 flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #7B61FF, #00C2FF)',
                  boxShadow: '0 8px 24px rgba(123, 97, 255, 0.3)',
                }}
              >
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#1A1A24] mb-3">
                Inizia il tuo primo progetto
              </h3>
              <p className="text-[#1A1A24]/50 text-sm leading-relaxed max-w-sm mx-auto mb-8">
                Scopri in pochi minuti se la tua operazione è profittevole. ROI, margini e sintesi
                professionale in un click.
              </p>
              <Link
                href="/plans/new"
                className="btn-glass-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm"
              >
                <Plus className="w-4 h-4" />
                Crea Nuova Operazione
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summary.projects.map((project: Project) => {
              const status = statusConfig[project.status] ?? statusConfig.draft;
              const stratColor =
                strategyColors[project.strategy] ??
                'bg-slate-500/10 text-slate-600 border-slate-500/20';

              return (
                <Link key={project.id} href={`/plans/${project.id}`} className="block group">
                  <div className="glass-panel overflow-hidden h-full hover:-translate-y-1">
                    {/* Top accent gradient */}
                    <div
                      className="h-1 w-full"
                      style={{
                        background: 'linear-gradient(90deg, #7B61FF, #00C2FF)',
                      }}
                    />

                    <div className="p-6">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-[#1A1A24] leading-snug line-clamp-2 flex-1 mr-2 group-hover:text-[#7B61FF] transition-colors">
                          {project.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[0.65rem] font-bold ${status.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      {/* Location */}
                      {(project.location_city || project.location_province) && (
                        <div className="flex items-center gap-1.5 text-xs text-[#1A1A24]/40 mb-4">
                          <MapPin className="w-3 h-3" />
                          {[project.location_city, project.location_province]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      )}

                      {/* Strategy badge + date */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#1A1A24]/[0.06]">
                        <span
                          className={`inline-block px-3 py-1 rounded-xl text-[0.65rem] font-bold border ${stratColor}`}
                        >
                          {strategyLabels[project.strategy] ?? project.strategy}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-[#1A1A24]/35">
                          <TrendingUp className="w-3 h-3" />
                          {formatDate(project.created_at)}
                        </div>
                      </div>

                      {/* CTA arrow */}
                      <div className="flex items-center justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[0.65rem] text-[#7B61FF] font-semibold flex items-center gap-1">
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
