'use server'

import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@/lib/generated/prisma/client'
import { imagekit } from '@/lib/imagekit'

export async function uploadImage(formData: FormData, projectId?: string) {
  try {
    const file = formData.get('file') as string;
    const fileName = formData.get('fileName') as string || 'image.png';
    const useUniqueFileName = formData.get('useUniqueFileName') === 'true';

    if (!file) {
      throw new Error('No file provided');
    }

    const folder = projectId ? `projects/${projectId}` : 'thumbnails';

    const result = await imagekit.upload({
      file, 
      fileName,
      useUniqueFileName: useUniqueFileName, 
      folder, 
    });

    if (projectId) {
       await prisma.projectImage.create({
          data: {
             url: result.url,
             fileId: result.fileId,
             thumbnail: result.thumbnailUrl,
             projectId: projectId
          }
       });
       revalidatePath(`/editor/${projectId}`);
    }

    return { success: true, url: result.url };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

export async function getProjectImages(projectId: string) {
   try {
      const images = await prisma.projectImage.findMany({
         where: { projectId },
         orderBy: { createdAt: 'desc' }
      });
      return images;
   } catch (error) {
      console.error('Fetch images error:', error);
      return [];
   }
}

export async function deleteProjectImage(imageId: string) {
    try {
        const image = await prisma.projectImage.findUnique({
            where: { id: imageId },
        });

        if (!image) {
           return { success: false, error: 'Image not found' };
        }

        if (image.fileId) {
            await imagekit.deleteFile(image.fileId);
        }

        await prisma.projectImage.delete({
            where: { id: imageId },
        });

        revalidatePath(`/editor/${image.projectId}`);
        return { success: true };
    } catch (error) {
        console.error('Delete image error:', error);
        return { success: false, error: 'Failed to delete image' };
    }
}

export async function createProject(data: {
  title: string
  canvasState: Prisma.InputJsonValue
  canvasWidth: number
  canvasHeight: number
  gridRows?: number
  gridCols?: number
}) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: 'User not found in database' }
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        canvasState: data.canvasState,
        canvasWidth: data.canvasWidth,
        canvasHeight: data.canvasHeight,
        gridRows: data.gridRows ?? 1,
        gridCols: data.gridCols ?? 1,
        ownerId: user.id,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, project }
  } catch (error) {
    console.error('Create project error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create project' 
    }
  }
}

export async function getUserProjects() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return []
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return user?.projects || []
  } catch (error) {
    console.error('Get projects error:', error)
    return []
  }
}

export async function updateProject(
  projectId: string,
  data: {
    title?: string
    canvasState?: Prisma.InputJsonValue
    canvasWidth?: number
    canvasHeight?: number
    thumbnailUrl?: string
  }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { owner: true },
    })

    if (!project || project.owner.id !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const updateData: Prisma.ProjectUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.canvasState !== undefined) updateData.canvasState = data.canvasState ?? Prisma.JsonNull;
    if (data.canvasWidth !== undefined) updateData.canvasWidth = data.canvasWidth;
    if (data.canvasHeight !== undefined) updateData.canvasHeight = data.canvasHeight;
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    })

    revalidatePath('/dashboard')
    revalidatePath(`/editor/${projectId}`)
    return { success: true, project: updated }
  } catch (error) {
    console.error('Update project error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update project' 
    }
  }
}

export async function deleteProject(projectId: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { owner: true },
    })

    if (!project || project.owner.id !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete from ImageKit (Folder)
    try {
        await imagekit.deleteFolder(`projects/${projectId}`);
    } catch (err) {
        console.log('ImageKit folder might not exist or error:', err);
        // Continue to delete project from DB even if ImageKit cleanup fails partially
    }

    await prisma.project.delete({
      where: { id: projectId },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Delete project error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete project' 
    }
  }
}