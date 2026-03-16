import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectSidebar } from '@/components/project/ProjectSidebar';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { MobileProjectSidebarProvider } from '@/components/project/MobileProjectSidebarContext';

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
        <div className="flex-1 lg:ml-56">
          <ProjectHeader />
          {children}
        </div>
      </div>
    </MobileProjectSidebarProvider>
  );
}
