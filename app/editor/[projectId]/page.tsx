import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CollageEditor from "@/app/editor/[projectId]/editor-client";
import { getProjectImages } from "@/app/actions";
import { CanvasState } from "@/types/project";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/get-started");
  }
  // const userId = "user_38FYOFLAIAJaJYgxFYfPrRRfaLi";

  const { projectId } = await params;

  // Fetch the project
  const fetchedProject = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true },
  });

  // Check if project exists and user owns it
  if (!fetchedProject || fetchedProject.owner.id !== userId) {
    redirect("/");
  }

  const project = {
    ...fetchedProject,
    canvasState: fetchedProject.canvasState as CanvasState,
  };

  // Fetch project images
  const images = await getProjectImages(projectId);

  return <CollageEditor project={project} projectImages={images} />;
}
