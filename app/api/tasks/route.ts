import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch user's boards or get from localStorage fallback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Fetch from database if user is signed in
      const boards = await prisma.board.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      return NextResponse.json({ boards });
    }

    // Return empty for unauthenticated users (they'll use localStorage)
    return NextResponse.json({ boards: [] });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST: Create or update a board
export async function POST(request: NextRequest) {
  try {
    const { userId, name, columns } = await request.json();

    if (!userId) {
      // For unauthenticated users, return success (they use localStorage)
      return NextResponse.json({ 
        message: 'Board saved to localStorage',
        localStorage: true 
      });
    }

    // Check if board exists for this user
    const existingBoard = await prisma.board.findFirst({
      where: { userId },
    });

    let board;
    if (existingBoard) {
      // Update existing board
      board = await prisma.board.update({
        where: { id: existingBoard.id },
        data: {
          name: name || existingBoard.name,
          columns: JSON.stringify(columns),
        },
      });
    } else {
      // Create new board
      board = await prisma.board.create({
        data: {
          userId,
          name: name || 'My Tasks',
          columns: JSON.stringify(columns),
        },
      });
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Save tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to save tasks' },
      { status: 500 }
    );
  }
}
