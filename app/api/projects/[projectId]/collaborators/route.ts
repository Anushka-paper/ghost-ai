import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getClerkUserByEmail } from '@/lib/clerk-helpers';
import {
  checkProjectAccess,
  getCurrentUser,
  normalizeEmail,
} from '@/lib/project-access';

// Lazy load prisma to avoid initialization issues during build
const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
};

function isPrismaUniqueConstraintError(
  error: unknown
): error is { code: 'P2002' } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

// GET /api/projects/[projectId]/collaborators - List collaborators
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    const prisma = await getPrisma();
    // Verify user has access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is owner or collaborator
    const isOwner = project.ownerId === user.userId;
    const hasAccess = await checkProjectAccess(projectId, user);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get collaborators
    const collaborators =
      await prisma.projectCollaborator.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' },
      });

    // Enrich collaborators with Clerk data
    const enriched = await Promise.all(
      collaborators.map(async (c) => {
        const clerkUser =
          await getClerkUserByEmail(c.email);

        return {
          email: c.email,
          displayName: clerkUser?.displayName ?? c.email,
          avatarUrl: clerkUser?.avatarUrl || null,
          createdAt: c.createdAt,
        };
      })
    );
    return NextResponse.json({
      isOwner,
      collaborators: enriched,
    });
  } catch (error) {
    console.error('GET /api/projects/[projectId]/collaborators error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/collaborators - Invite collaborator
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const body = await request.json();
    const { email } = body;

    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    const prisma = await getPrisma();
    // Verify project exists and user is owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Use create and catch unique constraint violation
    try {
      const collaborator = await prisma.projectCollaborator.create({
        data: {
          projectId,
          email: normalizedEmail,
        },
      });
      return NextResponse.json(collaborator, { status: 201 });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'Collaborator already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error(
      'POST /api/projects/[projectId]/collaborators error:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
