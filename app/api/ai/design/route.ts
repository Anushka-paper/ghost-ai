import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkProjectAccess } from '@/lib/project-access';
import type { designAgent } from '@/trigger/design-agent';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, roomId, projectId } = body ?? {};

    if (!prompt || !projectId || !roomId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify access to the project
    const hasAccess = await checkProjectAccess(projectId, currentUser);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Trigger the design task via Trigger.dev
    const { tasks } = await import('@trigger.dev/sdk');

    const handle = await tasks.trigger<typeof designAgent>('design-agent', {
      prompt,
      roomId,
      projectId,
      userId: currentUser.userId,
    });

    const runId = (handle as any)?.id ?? (handle as any)?.runId ?? null;

    if (!runId) {
      console.error('Unexpected Trigger.dev trigger response', handle);
      return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
    }

    // Persist TaskRun record
    const { prisma } = await import('@/lib/prisma');
    await prisma.taskRun.create({
      data: {
        runId,
        projectId,
        userId: currentUser.userId,
      },
    });

    return NextResponse.json({ runId }, { status: 201 });
  } catch (error) {
    console.error('Design trigger error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
