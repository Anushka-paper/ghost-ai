import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { checkProjectAccess, getCurrentUser } from '@/lib/project-access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId, specId } = await params;

    // Verify project access
    const hasAccess = await checkProjectAccess(projectId, user);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Verify spec existence and project mapping
    const { prisma } = await import('@/lib/prisma');
    const projectSpec = await prisma.projectSpec.findUnique({
      where: { id: specId },
    });

    if (!projectSpec || projectSpec.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Specification not found' },
        { status: 404 }
      );
    }

    // Fetch spec file from Vercel Blob
    const blob = await get(projectSpec.filePath, {
      access: 'private',
      useCache: false,
    });

    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return NextResponse.json(
        { error: 'Specification content could not be loaded' },
        { status: 404 }
      );
    }

    const content = await new Response(blob.stream).text();

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="spec-${specId}.md"`,
      },
    });
  } catch (error) {
    console.error('GET /api/projects/[projectId]/specs/[specId]/download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
