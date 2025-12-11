import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// GET /api/user/friends - List friends and pending requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACCEPTED';
    const type = searchParams.get('type') || 'all'; // 'sent', 'received', 'all'

    // Get friendships based on status and type
    const friendships = await prisma.friendship.findMany({
      where: {
        status: status as 'PENDING' | 'ACCEPTED' | 'BLOCKED',
        ...(type === 'sent'
          ? { requesterId: userId }
          : type === 'received'
            ? { addresseeId: userId }
            : {
                OR: [{ requesterId: userId }, { addresseeId: userId }],
              }),
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
            gameProgress: {
              select: {
                level: true,
                xp: true,
                streak: true,
              },
            },
          },
        },
        addressee: {
          select: {
            id: true,
            name: true,
            image: true,
            gameProgress: {
              select: {
                level: true,
                xp: true,
                streak: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform to return the "other" user in each friendship
    type FriendshipWithUsers = (typeof friendships)[number];
    const friends = friendships.map((f: FriendshipWithUsers) => {
      const isRequester = f.requesterId === userId;
      const friend = isRequester ? f.addressee : f.requester;
      return {
        friendshipId: f.id,
        status: f.status,
        createdAt: f.createdAt,
        isRequester,
        friend: {
          id: friend.id,
          name: friend.name,
          image: friend.image,
          level: friend.gameProgress?.level ?? 'beginner',
          xp: friend.gameProgress?.xp ?? 0,
          streak: friend.gameProgress?.streak ?? 0,
        },
      };
    });

    return NextResponse.json({
      friends,
      count: friends.length,
    });
  } catch (error) {
    console.error('[api.user.friends] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}

const sendRequestSchema = z.object({
  addresseeId: z.string().min(1, 'User ID is required'),
});

// POST /api/user/friends - Send friend request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const parsed = sendRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { addresseeId } = parsed.data;

    // Can't friend yourself
    if (addresseeId === userId) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if addressee exists
    const addressee = await prisma.user.findUnique({
      where: { id: addresseeId },
      select: { id: true, name: true },
    });

    if (!addressee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if friendship already exists (in either direction)
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId },
          { requesterId: addresseeId, addresseeId: userId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'BLOCKED') {
        return NextResponse.json(
          { error: 'Unable to send friend request' },
          { status: 400 }
        );
      }
      if (existingFriendship.status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Already friends with this user' },
          { status: 400 }
        );
      }
      if (existingFriendship.status === 'PENDING') {
        // If they sent us a request, auto-accept
        if (existingFriendship.requesterId === addresseeId) {
          const updated = await prisma.friendship.update({
            where: { id: existingFriendship.id },
            data: { status: 'ACCEPTED' },
          });
          return NextResponse.json({
            message: 'Friend request accepted',
            friendship: updated,
          });
        }
        return NextResponse.json(
          { error: 'Friend request already pending' },
          { status: 400 }
        );
      }
    }

    // Create new friend request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: userId,
        addresseeId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        message: 'Friend request sent',
        friendship,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[api.user.friends] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}
