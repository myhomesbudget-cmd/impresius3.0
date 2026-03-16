import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectSidebar } from '@/components/project/ProjectSidebar';

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
    <div className="flex min-h-screen">
      <ProjectSidebar project={project} />
      <div className="flex-1 ml-56">
        {children}
      </div>
    </div>
  );
}
