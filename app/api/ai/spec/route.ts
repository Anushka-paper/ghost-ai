import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkProjectAccess } from '@/lib/project-access';
import type { generateSpec } from '@/trigger/generate-spec';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { roomId, chatHistory, nodes, edges } = body ?? {};

    if (!roomId || !chatHistory || !nodes || !edges) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify access to the project using roomId (acting as the projectId)
    const hasAccess = await checkProjectAccess(roomId, currentUser);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Trigger the spec generation task via Trigger.dev
    const { tasks } = await import('@trigger.dev/sdk');

    const handle = await tasks.trigger<typeof generateSpec>('generate-spec', {
      projectId: roomId, // Using roomId as projectId, do not trust client-supplied projectId
      roomId,
      chatHistory,
      nodes,
      edges,
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
        projectId: roomId,
        userId: currentUser.userId,
      },
    });

    return NextResponse.json({ runId }, { status: 201 });
  } catch (error) {
    console.error('Spec trigger error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
