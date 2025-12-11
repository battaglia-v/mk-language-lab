import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  action: z.enum(['accept', 'reject', 'block', 'unblock']),
});

// PATCH /api/user/friends/[friendshipId] - Accept, reject, block, or unblock
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendshipId } = await params;
    const userId = session.user.id;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { action } = parsed.data;

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    // Check user is part of this friendship
    const isRequester = friendship.requesterId === userId;
    const isAddressee = friendship.addresseeId === userId;

    if (!isRequester && !isAddressee) {
      return NextResponse.json(
        { error: 'Not authorized to modify this friendship' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'accept':
        // Only addressee can accept
        if (!isAddressee) {
          return NextResponse.json(
            { error: 'Only the recipient can accept a friend request' },
            { status: 403 }
          );
        }
        if (friendship.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Can only accept pending requests' },
            { status: 400 }
          );
        }
        await prisma.friendship.update({
          where: { id: friendshipId },
          data: { status: 'ACCEPTED' },
        });
        return NextResponse.json({ message: 'Friend request accepted' });

      case 'reject':
        // Addressee rejects pending request (deletes it)
        if (!isAddressee || friendship.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Can only reject pending requests you received' },
            { status: 400 }
          );
        }
        await prisma.friendship.delete({
          where: { id: friendshipId },
        });
        return NextResponse.json({ message: 'Friend request rejected' });

      case 'block':
        // Either party can block
        await prisma.friendship.update({
          where: { id: friendshipId },
          data: { status: 'BLOCKED' },
        });
        return NextResponse.json({ message: 'User blocked' });

      case 'unblock':
        // Only if currently blocked
        if (friendship.status !== 'BLOCKED') {
          return NextResponse.json(
            { error: 'User is not blocked' },
            { status: 400 }
          );
        }
        // Delete the friendship record (they can re-friend if they want)
        await prisma.friendship.delete({
          where: { id: friendshipId },
        });
        return NextResponse.json({ message: 'User unblocked' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[api.user.friends.friendshipId] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update friendship' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/friends/[friendshipId] - Remove friend or cancel request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendshipId } = await params;
    const userId = session.user.id;

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    // Check user is part of this friendship
    const isParticipant =
      friendship.requesterId === userId || friendship.addresseeId === userId;

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Not authorized to delete this friendship' },
        { status: 403 }
      );
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return NextResponse.json({
      message:
        friendship.status === 'PENDING'
          ? 'Friend request cancelled'
          : 'Friend removed',
    });
  } catch (error) {
    console.error('[api.user.friends.friendshipId] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    );
  }
}
