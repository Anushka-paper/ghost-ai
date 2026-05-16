import { getCurrentUser } from '@/lib/project-access';

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  status: string;
  canvasJsonPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProjectsForUser(): Promise<{
  ownedProjects: Project[];
  sharedProjects: Project[];
}> {
  try {
    // Lazy load prisma to avoid initialization during build
    const { prisma } = await import('@/lib/prisma');

    const user = await getCurrentUser();

    if (!user) {
      return { ownedProjects: [], sharedProjects: [] };
    }

    // Get owned projects
    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get shared projects (via collaborators table)
    const sharedProjects = await prisma.project.findMany({
      where: {
        collaborators: {
          some: {
            email: {
              equals: user.primaryEmail,
              mode: 'insensitive',
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { ownedProjects, sharedProjects };
  } catch (error) {
    // If there's any error (including during build), return empty arrays
    console.error('Error fetching projects:', error);
    return { ownedProjects: [], sharedProjects: [] };
  }
}
