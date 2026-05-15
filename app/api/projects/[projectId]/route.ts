import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Lazy load prisma to avoid initialization issues during build
const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
};

// PATCH /api/projects/[projectId] - Rename project
export async function PATCH(
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
    const { name, description } = body;

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

    // Update project
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/projects/[projectId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId] - Delete project
export async function DELETE(
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

    // Delete project (cascade delete handles collaborators)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json(
      { message: 'Project deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/projects/[projectId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
