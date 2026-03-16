'use client';

import { Menu } from 'lucide-react';
import { useMobileProjectSidebar } from './MobileProjectSidebarContext';

export function ProjectHeader() {
  const { toggle } = useMobileProjectSidebar();

  return (
    <div className="lg:hidden flex items-center px-4 py-3 border-b border-gray-200 bg-white">
      <button
        onClick={toggle}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Apri menu progetto"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
      <span className="ml-2 text-sm font-medium text-gray-600">Menu Progetto</span>
    </div>
  );
}
