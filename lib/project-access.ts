import { auth, currentUser } from '@clerk/nextjs/server';

export interface UserIdentity {
  userId: string;
  primaryEmail: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Get current Clerk user identity (userId + primary email)
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<UserIdentity | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;

  if (!primaryEmail) {
    return null;
  }

  return { userId, primaryEmail: normalizeEmail(primaryEmail) };
}

/**
 * Check if user has access to a project (by owner or collaborator)
 * Lazy-loads prisma to avoid build-time initialization issues
 */
export async function checkProjectAccess(
  projectId: string,
  user: UserIdentity
): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma');

    // Check if user is the project owner
    const ownedProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (ownedProject && ownedProject.ownerId === user.userId) {
      return true;
    }

    // Check if user is a collaborator
    const collaborator =
      await prisma.projectCollaborator.findFirst({
        where: {
          projectId,
          email: {
            equals: user.primaryEmail,
            mode: 'insensitive',
          },
        },
      });

    return !!collaborator;
  } catch (error) {
    console.error('Error checking project access:', error);
    return false;
  }
}

/**
 * Get project by ID with optional access check
 * Returns null if project doesn't exist or user doesn't have access
 */
export async function getProjectWithAccess(
  projectId: string,
  user: UserIdentity
) {
  try {
    const { prisma } = await import('@/lib/prisma');

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return null;
    }

    // Check access
    const hasAccess = await checkProjectAccess(projectId, user);
    if (!hasAccess) {
      return null;
    }

    return project;
  } catch (error) {
    console.error('Error getting project:', error);
    return null;
  }
}
