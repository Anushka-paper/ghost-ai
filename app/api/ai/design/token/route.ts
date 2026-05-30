import { NextRequest, NextResponse } from 'next/server';
import { auth as clerkAuth } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/lib/project-access';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await clerkAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { runId } = await req.json();
    if (!runId) {
      return NextResponse.json({ error: 'runId is required' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { prisma } = await import('@/lib/prisma');
    const taskRun = await prisma.taskRun.findUnique({ where: { runId } });

    if (!taskRun) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    if (taskRun.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create a Trigger.dev public token scoped to this run
    const { auth: triggerAuth } = await import('@trigger.dev/sdk');

    const tokenResponse = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
      expirationTime: '1h',
    } as any);

    return NextResponse.json({ token: tokenResponse }, { status: 200 });
  } catch (error) {
    console.error('Design token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
