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
  Filter,
} from 'lucide-react';

const strategyLabels: Record<string, string> = {
  ristrutturazione: 'Ristrutturazione',
  frazionamento: 'Frazionamento',
  nuova_costruzione: 'Nuova Costruzione',
  rivendita: 'Rivendita',
};

const strategyColors: Record<string, string> = {
  ristrutturazione: 'bg-blue-100 text-blue-700',
  frazionamento: 'bg-purple-100 text-purple-700',
  nuova_costruzione: 'bg-emerald-100 text-emerald-700',
  rivendita: 'bg-amber-100 text-amber-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Bozza',
  active: 'Attivo',
  archived: 'Archiviato',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-red-100 text-red-600',
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

  // Fetch projects on mount
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter projects
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

  // Duplicate project
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

  // Archive project
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
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Le mie Operazioni
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestisci tutte le tue operazioni immobiliari
          </p>
        </div>
        <Link href="/plans/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuova Operazione
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                statusFilter === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessuna operazione trovata
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
              {projects.length === 0
                ? 'Crea la tua prima operazione immobiliare per iniziare ad analizzare costi, ricavi e margini.'
                : 'Nessuna operazione corrisponde ai filtri selezionati.'}
            </p>
            {projects.length === 0 && (
              <Link href="/plans/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Operazione
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                    Nome
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                    Localita
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                    Strategia
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                    Stato
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                    Data
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/plans/${project.id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <FolderOpen className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      {project.location_city || project.location_province ? (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="line-clamp-1">
                            {[project.location_city, project.location_province]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          strategyColors[project.strategy] ||
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {strategyLabels[project.strategy] || project.strategy}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[project.status] ||
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {statusLabels[project.status] || project.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {formatDate(project.updated_at)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block" ref={openMenuId === project.id ? menuRef : undefined}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === project.id ? null : project.id
                            );
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === project.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <Link
                              href={`/plans/${project.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Apri
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(project);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <Copy className="w-4 h-4" />
                              Duplica
                            </button>
                            {project.status !== 'archived' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchive(project);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                              >
                                <Archive className="w-4 h-4" />
                                Archivia
                              </button>
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
