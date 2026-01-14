import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import  prisma  from '@/lib/prisma';
import CollageEditor from '@/components/editor/collage-editor';

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { projectId } = await params;

  // Fetch the project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true },
  });

  // Check if project exists and user owns it
  if (!project || project.owner.id !== userId) {
    redirect('/dashboard');
  }

  return <CollageEditor project={project} />;
}