import { NextRequest, NextResponse } from 'next/server';
import { checkProjectAccess, getCurrentUser } from '@/lib/project-access';

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

    // Verify project access
    const hasAccess = await checkProjectAccess(projectId, user);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Query specs for the project
    const { prisma } = await import('@/lib/prisma');
    const specs = await prisma.projectSpec.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(specs, { status: 200 });
  } catch (error) {
    console.error('GET /api/projects/[projectId]/specs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
