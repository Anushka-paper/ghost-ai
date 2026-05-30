import { auth } from '@clerk/nextjs/server';
import { get, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { checkProjectAccess, getCurrentUser } from '@/lib/project-access';

const getPrisma = async () => {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
};

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
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const hasAccess = await checkProjectAccess(projectId, user);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!project.canvasJsonPath) {
      return NextResponse.json(
        { error: 'Saved canvas not found' },
        { status: 404 }
      );
    }

    const blob = await get(project.canvasJsonPath, {
      access: 'private',
      useCache: false,
    });

    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return NextResponse.json(
        { error: 'Saved canvas could not be loaded' },
        { status: 404 }
      );
    }

    const text = await new Response(blob.stream).text();
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('GET /api/projects/[projectId]/canvas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { nodes, edges } = body;

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        { error: 'Invalid canvas payload' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = await getPrisma();
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const hasAccess = await checkProjectAccess(projectId, user);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const serializedCanvas = JSON.stringify({ nodes, edges });
    const pathname = `canvas/${projectId}.json`;
    const blob = await put(pathname, serializedCanvas, {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true,
    });

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        canvasJsonPath: blob.url,
      },
    });

    return NextResponse.json({
      canvasJsonPath: updated.canvasJsonPath,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('PUT /api/projects/[projectId]/canvas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
