import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { normalizeEmail } from '@/lib/project-access';

// Lazy load prisma to avoid initialization issues during build
const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
};

// DELETE /api/projects/[projectId]/collaborators/[email] - Remove collaborator
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; email: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId, email } = await params;
    const normalizedEmail = normalizeEmail(decodeURIComponent(email));

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

    // Delete collaborator
    await prisma.projectCollaborator.deleteMany({
      where: {
        projectId,
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      },
    });

    return NextResponse.json(
      { message: 'Collaborator removed' },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'DELETE /api/projects/[projectId]/collaborators/[email] error:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
