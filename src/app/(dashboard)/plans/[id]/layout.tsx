import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectSidebar } from '@/components/project/ProjectSidebar';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { MobileProjectSidebarProvider } from '@/components/project/MobileProjectSidebarContext';
import { ProjectProgress } from '@/components/project/ProjectProgress';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (!project) {
    redirect('/dashboard');
  }

  return (
    <MobileProjectSidebarProvider>
      <div className="flex min-h-screen">
        <ProjectSidebar project={project} />
        <div className="flex-1 min-w-0 lg:ml-56">
          <ProjectProgress projectId={id} />
          <ProjectHeader projectId={id} />
          <div className="pb-20 lg:pb-0">{children}</div>
        </div>
      </div>
    </MobileProjectSidebarProvider>
  );
}
