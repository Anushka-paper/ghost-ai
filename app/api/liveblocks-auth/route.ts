import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getLiveblocks, getUserCursorColor } from '@/lib/liveblocks';
import { checkProjectAccess, getCurrentUser } from '@/lib/project-access';
import { getClerkUserByEmail } from '@/lib/clerk-helpers';

export async function POST(req: NextRequest) {
  try {
    // Require Clerk authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the room ID from the request body (Liveblocks sends it as 'room')
    const { room } = await req.json();
    if (!room) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get current user info for access check
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify project access using the existing access helper
    const hasAccess = await checkProjectAccess(room, currentUser);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch additional user data from Clerk (display name and avatar)
    const clerkUser = await getClerkUserByEmail(currentUser.primaryEmail);

    const displayName = clerkUser?.displayName || currentUser.primaryEmail;
    const avatarUrl = clerkUser?.avatarUrl || '';

    // The room ID comes from the client (Canvas component passes projectId as roomId)
    const roomId = room;

    // Ensure the Liveblocks room exists (create if needed)
    const liveblocks = getLiveblocks();
    await liveblocks.getOrCreateRoom(roomId, {
      defaultAccesses: [],
    }).catch(() => {
      // Room might already exist, that's fine
    });

    // Ensure the room-scoped feeds are created
    await Promise.allSettled([
      liveblocks.createFeed({ roomId, feedId: 'ai-status-feed' }),
      liveblocks.createFeed({ roomId, feedId: 'ai-chat' }),
    ]).catch((err) => {
      console.warn('Failed to initialize Liveblocks feeds:', err);
    });

    // Generate cursor color for this user
    const cursorColor = getUserCursorColor(userId);

    // Create and return a session token with user metadata
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        id: userId,
        name: displayName,
        avatar: avatarUrl,
        cursorColor,
      },
    });

    // Grant access to the room
    session.allow(roomId, session.FULL_ACCESS);

    const { status, body } = await session.authorize();

    return NextResponse.json(JSON.parse(body), { status });
  } catch (error) {
    console.error('Liveblocks auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
