'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMobileProjectSidebar } from './MobileProjectSidebarContext';
import {
  Menu,
  FileText,
  Receipt,
  Hammer,
  TrendingUp,
  BarChart3,
  MoreHorizontal,
} from 'lucide-react';

interface ProjectHeaderProps {
  projectId: string;
}

const mobileNavItems = [
  { href: '', icon: FileText, label: 'Dati', exact: true },
  { href: '/acquisition', icon: Receipt, label: 'Acquis.' },
  { href: '/construction', icon: Hammer, label: 'Computo' },
  { href: '/valuation', icon: TrendingUp, label: 'Vendita' },
  { href: '/summary', icon: BarChart3, label: 'Sintesi' },
];

export function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const { toggle } = useMobileProjectSidebar();
  const pathname = usePathname();
  const basePath = `/plans/${projectId}`;

  return (
    <>
      {/* Top bar with hamburger — mobile/tablet only */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <button
          onClick={toggle}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Apri menu progetto"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <span className="text-sm font-bold text-slate-700 truncate mx-3">Navigazione</span>
        <div className="w-9" />
      </div>

      {/* Bottom tab bar — mobile/tablet only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] safe-bottom">
        <nav className="flex items-stretch justify-around px-1">
          {mobileNavItems.map((item) => {
            const fullHref = `${basePath}${item.href}`;
            const isActive = item.exact
              ? pathname === fullHref
              : pathname.startsWith(fullHref);

            return (
              <Link
                key={item.href}
                href={fullHref}
                className={cn(
                  'flex flex-col items-center justify-center py-2.5 px-1 min-w-0 flex-1 transition-colors relative',
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-blue-600 rounded-full" />
                )}
                <item.icon className={cn('w-5 h-5', isActive && 'text-blue-600')} />
                <span className={cn(
                  'text-[10px] mt-0.5 font-semibold truncate',
                  isActive ? 'text-blue-600' : 'text-slate-500'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* "Altro" button opens full drawer */}
          <button
            onClick={toggle}
            className="flex flex-col items-center justify-center py-2.5 px-1 min-w-0 flex-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">Altro</span>
          </button>
        </nav>
      </div>
    </>
  );
}
