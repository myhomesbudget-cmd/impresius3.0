'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/types/database';
import {
  Plus,
  Search,
  FolderOpen,
  Building2,
  MapPin,
  MoreVertical,
  Copy,
  Archive,
  ExternalLink,
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

type StatusFilter = 'all' | 'active' | 'draft' | 'archived';

const tabs: { label: string; value: StatusFilter }[] = [
  { label: 'Tutti', value: 'all' },
  { label: 'Attivi', value: 'active' },
  { label: 'Bozze', value: 'draft' },
  { label: 'Archiviati', value: 'archived' },
];

export default function PlansPage() {
  const router = useRouter();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProjects() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      setProjects((data || []) as Project[]);
      setLoading(false);
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.location_city && p.location_city.toLowerCase().includes(q)) ||
          (p.location_province && p.location_province.toLowerCase().includes(q))
      );
    }

    return result;
  }, [projects, statusFilter, searchQuery]);

  async function handleDuplicate(project: Project) {
    setOpenMenuId(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: `${project.name} (copia)`,
        description: project.description,
        location_city: project.location_city,
        location_province: project.location_province,
        location_address: project.location_address,
        property_type: project.property_type,
        strategy: project.strategy,
        status: project.status,
        is_free_plan: project.is_free_plan,
      })
      .select()
      .single();

    if (!error && data) {
      setProjects((prev) => [data as Project, ...prev]);
    }
  }

  async function handleArchive(project: Project) {
    setOpenMenuId(null);

    const { error } = await supabase
      .from('projects')
      .update({ status: 'archived' })
      .eq('id', project.id);

    if (!error) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, status: 'archived' as const } : p
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="h-9 w-64 rounded-lg animate-shimmer" />
          <div className="h-5 w-48 rounded-lg animate-shimmer mt-3" />
        </div>
        <div className="flex gap-4 mb-6">
          <div className="h-10 w-64 rounded-lg animate-shimmer" />
          <div className="h-10 w-48 rounded-lg animate-shimmer" />
        </div>
        <div className="h-96 rounded-xl animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="page-header-title">Le mie Operazioni</h1>
          <p className="page-header-subtitle">
            Gestisci tutte le tue operazioni immobiliari
          </p>
        </div>
        <Link href="/plans/new">
          <Button variant="gradient" className="gap-2">
            <Plus className="w-4 h-4" />
            Nuova Operazione
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1 border border-slate-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                statusFilter === tab.value
                  ? 'bg-white text-slate-900 shadow-[0_1px_3px_rgb(0_0_0/0.08)]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cerca per nome o citta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Projects Table / List */}
      {filteredProjects.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 hover:shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="empty-state-icon">
              <Building2 className="w-9 h-9 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Nessuna operazione trovata
            </h3>
            <p className="text-sm text-slate-500 mb-8 text-center max-w-sm leading-relaxed">
              {projects.length === 0
                ? 'Crea la tua prima operazione immobiliare per iniziare ad analizzare costi, ricavi e margini.'
                : 'Nessuna operazione corrisponde ai filtri selezionati.'}
            </p>
            {projects.length === 0 && (
              <Link href="/plans/new">
                <Button variant="gradient" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuova Operazione
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th className="text-left">Nome</th>
                  <th className="text-left hidden sm:table-cell">Localita</th>
                  <th className="text-left hidden md:table-cell">Strategia</th>
                  <th className="text-left">Stato</th>
                  <th className="text-left hidden lg:table-cell">Data</th>
                  <th className="text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/plans/${project.id}`)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="icon-container icon-container-sm rounded-lg bg-blue-50">
                          <FolderOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-900 line-clamp-1">
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      {project.location_city || project.location_province ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="line-clamp-1">
                            {[project.location_city, project.location_province]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-300">-</span>
                      )}
                    </td>
                    <td className="hidden md:table-cell">
                      <span
                        className={`badge-premium ${
                          strategyColors[project.strategy] ||
                          'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {strategyLabels[project.strategy] || project.strategy}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-premium ${
                          statusColors[project.status] ||
                          'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {statusLabels[project.status] || project.status}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className="text-sm font-medium text-slate-500">
                        {formatDate(project.updated_at)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="relative inline-block" ref={openMenuId === project.id ? menuRef : undefined}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === project.id ? null : project.id
                            );
                          }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === project.id && (
                          <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-[0_4px_12px_rgb(0_0_0/0.1),0_1px_3px_rgb(0_0_0/0.06)] border border-slate-200/80 py-1.5 z-50 animate-scale-in">
                            <Link
                              href={`/plans/${project.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                              Apri
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(project);
                              }}
                              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                            >
                              <Copy className="w-4 h-4 text-slate-400" />
                              Duplica
                            </button>
                            {project.status !== 'archived' && (
                              <>
                                <div className="mx-3 my-1 border-t border-slate-100" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(project);
                                  }}
                                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                >
                                  <Archive className="w-4 h-4" />
                                  Archivia
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
