import { getClerkUserByEmail } from '@/lib/clerk-helpers';
import {
  checkProjectAccess,
  getCurrentUser,
} from '@/lib/project-access';

// Lazy load prisma to avoid initialization issues during build
const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
};

/**
 * Server action to fetch collaborators with Clerk data enrichment
 * Returns structured result with success flag to distinguish errors from empty results
 */
export async function fetchCollaboratorsWithEnrichment(
  projectId: string
): Promise<{
  success: boolean;
  data?: Array<{
    email: string;
    displayName?: string;
    avatarUrl?: string | null;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const prisma = await getPrisma();

    // Verify user has access to project
    const hasAccess = await checkProjectAccess(projectId, user);
    if (!hasAccess) {
      return {
        success: false,
        error: 'Project not found',
      };
    }

    // Get collaborators
    const collaborators =
      await prisma.projectCollaborator.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' },
      });

    // Enrich each collaborator with Clerk data
    const enriched = await Promise.all(
      collaborators.map(async (c) => {
        const clerkUser =
          await getClerkUserByEmail(c.email);

        return {
          email: c.email,
          displayName: clerkUser?.displayName,
          avatarUrl: clerkUser?.avatarUrl || null,
          createdAt: c.createdAt,
        };
      })
    );

    return {
      success: true,
      data: enriched,
    };
  } catch (error) {
    console.error(
      'Error fetching collaborators with enrichment:',
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch collaborators',
    };
  }
}
