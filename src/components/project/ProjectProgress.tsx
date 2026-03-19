'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const steps = [
  { path: '', label: 'Dati Generali' },
  { path: '/acquisition', label: 'Acquisizione' },
  { path: '/construction', label: 'Lavori' },
  { path: '/valuation', label: 'Vendita' },
  { path: '/summary', label: 'Sintesi' },
  { path: '/report', label: 'Report' }
];

export function ProjectProgress({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  
  let currentIndex = 0;
  steps.forEach((step, index) => {
    const isRoot = step.path === '';
    const matchPath = `/plans/${projectId}${step.path}`;
    
    if (isRoot) {
      if (pathname === `/plans/${projectId}`) currentIndex = index;
    } else {
      if (pathname.includes(matchPath)) currentIndex = index;
    }
  });

  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full bg-slate-100 h-1.5 sticky top-0 z-50 overflow-hidden">
      <motion.div 
        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
