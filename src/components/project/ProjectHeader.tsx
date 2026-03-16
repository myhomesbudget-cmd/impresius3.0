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
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={toggle}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Apri menu progetto"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-700 truncate mx-3">Navigazione</span>
        <div className="w-9" />
      </div>

      {/* Bottom tab bar — mobile/tablet only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
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
                  'flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 transition-colors',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'text-blue-600')} />
                <span className={cn(
                  'text-[10px] mt-0.5 font-medium truncate',
                  isActive ? 'text-blue-600' : 'text-gray-500'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* "Altro" button opens full drawer */}
          <button
            onClick={toggle}
            className="flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Altro</span>
          </button>
        </nav>
      </div>
    </>
  );
}
