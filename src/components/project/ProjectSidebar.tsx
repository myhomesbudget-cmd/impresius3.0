'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMobileProjectSidebar } from './MobileProjectSidebarContext';
import type { Project } from '@/types/database';
import {
  FileText,
  Receipt,
  Hammer,
  TrendingUp,
  BarChart3,
  GitBranch,
  Activity,
  FileDown,
  ArrowLeft,
  X,
  MapPin,
} from 'lucide-react';

interface ProjectSidebarProps {
  project: Project;
}

const statusConfig = {
  draft: { label: 'Bozza', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' },
  active: { label: 'Attivo', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' },
  archived: { label: 'Archiviato', className: 'bg-muted text-muted-foreground border border-border' },
} as const;

function ProjectSidebarContent({ project, onNavigate }: { project: Project; onNavigate?: () => void }) {
  const pathname = usePathname();
  const basePath = `/plans/${project.id}`;

  const navItems = [
    { href: basePath, icon: FileText, label: 'Dati Generali', exact: true },
    { href: `${basePath}/acquisition`, icon: Receipt, label: 'Acquisizione', exact: false },
    { href: `${basePath}/construction`, icon: Hammer, label: 'Computo Metrico', exact: false },
    { href: `${basePath}/valuation`, icon: TrendingUp, label: 'Stima Vendita', exact: false },
    { href: `${basePath}/summary`, icon: BarChart3, label: 'Sintesi', exact: false },
    { href: `${basePath}/scenarios`, icon: GitBranch, label: 'Scenari', exact: false },
    { href: `${basePath}/monitoring`, icon: Activity, label: 'Monitoring', exact: false },
    { href: `${basePath}/report`, icon: FileDown, label: 'Report', exact: false },
  ];

  const status = statusConfig[project.status] ?? statusConfig.draft;

  return (
    <>
      {/* Project Header */}
      <div className="px-4 py-5 border-b border-border bg-muted/50">
        <h2 className="text-sm font-bold text-foreground truncate" title={project.name}>
          {project.name}
        </h2>
        {project.location_city && (
          <p className="mt-1 text-xs text-muted-foreground truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {project.location_city}
            {project.location_province ? ` (${project.location_province})` : ''}
          </p>
        )}
        <span
          className={cn(
            'mt-2.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold',
            status.className
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-gradient-to-b from-primary to-[hsl(243_75%_59%)] rounded-full" />
              )}
              <item.icon
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back Link */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla Dashboard
        </Link>
      </div>
    </>
  );
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  const { isOpen, close } = useMobileProjectSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-64 top-0 h-full w-56 bg-sidebar/90 backdrop-blur-md border-r border-sidebar-border flex-col z-30">
        <ProjectSidebarContent project={project} />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={close}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-full w-72 bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <span className="text-sm font-bold text-foreground">Navigazione Progetto</span>
          <button onClick={close} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <ProjectSidebarContent project={project} onNavigate={close} />
      </aside>
    </>
  );
}
