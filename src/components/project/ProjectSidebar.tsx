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
} from 'lucide-react';

interface ProjectSidebarProps {
  project: Project;
}

const statusConfig = {
  draft: { label: 'Bozza', className: 'bg-amber-100 text-amber-700' },
  active: { label: 'Attivo', className: 'bg-emerald-100 text-emerald-700' },
  archived: { label: 'Archiviato', className: 'bg-gray-100 text-gray-600' },
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
      <div className="px-4 py-5 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 truncate" title={project.name}>
          {project.name}
        </h2>
        {project.location_city && (
          <p className="mt-0.5 text-xs text-gray-500 truncate">
            {project.location_city}
            {project.location_province ? ` (${project.location_province})` : ''}
          </p>
        )}
        <span
          className={cn(
            'mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
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
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isActive ? 'text-blue-600' : 'text-gray-400'
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back Link */}
      <div className="px-3 py-4 border-t border-gray-100">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
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
      <aside className="hidden lg:flex fixed left-64 top-0 h-full w-56 bg-white border-r border-gray-200 flex-col z-30">
        <ProjectSidebarContent project={project} />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={close}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Navigazione Progetto</span>
          <button onClick={close} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <ProjectSidebarContent project={project} onNavigate={close} />
      </aside>
    </>
  );
}
