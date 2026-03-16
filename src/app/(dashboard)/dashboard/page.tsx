import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { STRATEGIES } from '@/types/database';
import type { Project } from '@/types/database';
import {
  Plus,
  FolderOpen,
  FileText,
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
  const isPremium = profile?.subscription_plan === 'premium';

  const greeting = profile?.full_name
    ? `Ciao, ${profile.full_name}`
    : 'Benvenuto';

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">{greeting}</p>
        </div>
        <Link href="/plans/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuova Operazione
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Operazioni Totali
              </span>
              <FolderOpen className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                In Bozza
              </span>
              <FilePenLine className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{draftProjects}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Valore Totale
              </span>
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            {isPremium ? (
              <p className="text-3xl font-bold text-gray-900">-</p>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                  <Crown className="w-3 h-3" />
                  Premium
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Le tue Operazioni
        </h2>

        {allProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessuna operazione
              </h3>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                Crea la tua prima operazione immobiliare per iniziare ad
                analizzare costi, ricavi e margini.
              </p>
              <Link href="/plans/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Operazione
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProjects.map((project) => (
              <Link
                key={project.id}
                href={`/plans/${project.id}`}
                className="block"
              >
                <Card className="h-full cursor-pointer hover:border-blue-300 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        {project.is_free_plan && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            Gratuito
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}
                        >
                          {statusLabels[project.status] || project.status}
                        </span>
                      </div>
                    </div>

                    {(project.location_city || project.location_province) && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {[project.location_city, project.location_province]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${strategyColors[project.strategy] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {strategyLabels[project.strategy] || project.strategy}
                      </span>
                      <span className="text-xs text-gray-400">
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
