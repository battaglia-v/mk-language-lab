import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import {
  ValidationError,
  ExternalServiceError,
  createErrorResponse,
} from '@/lib/errors';

// GET: Fetch user's boards or get from localStorage fallback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Fetch from database if user is signed in with timeout
      const boardsPromise = prisma.board.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      // Add 5 second timeout for database query
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new ExternalServiceError('Database query timeout', 504)), 5000);
      });

      const boards = await Promise.race([boardsPromise, timeoutPromise]);

      return NextResponse.json({ boards });
    }

    // Return empty for unauthenticated users (they'll use localStorage)
    return NextResponse.json({ boards: [] });
  } catch (error) {
    console.error('Get tasks error:', error);

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ExternalServiceError('Database error: ' + error.message);
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new ExternalServiceError('Database connection failed');
    }

    const { response, status } = createErrorResponse(error, 'Failed to fetch tasks');
    return NextResponse.json(response, { status });
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

    // Validate columns data
    if (!columns) {
      throw new ValidationError('Columns data is required');
    }

    // Check if board exists for this user with timeout
    const existingBoardPromise = prisma.board.findFirst({
      where: { userId },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new ExternalServiceError('Database query timeout', 504)), 5000);
    });

    const existingBoard = await Promise.race([existingBoardPromise, timeoutPromise]);

    let board;
    if (existingBoard) {
      // Update existing board with timeout
      const updatePromise = prisma.board.update({
        where: { id: existingBoard.id },
        data: {
          name: name || existingBoard.name,
          columns: JSON.stringify(columns),
        },
      });

      board = await Promise.race([updatePromise, new Promise<never>((_, reject) => {
        setTimeout(() => reject(new ExternalServiceError('Database update timeout', 504)), 5000);
      })]);
    } else {
      // Create new board with timeout
      const createPromise = prisma.board.create({
        data: {
          userId,
          name: name || 'My Tasks',
          columns: JSON.stringify(columns),
        },
      });

      board = await Promise.race([createPromise, new Promise<never>((_, reject) => {
        setTimeout(() => reject(new ExternalServiceError('Database create timeout', 504)), 5000);
      })]);
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Save tasks error:', error);

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ExternalServiceError('Database error: ' + error.message);
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new ExternalServiceError('Database connection failed');
    }

    const { response, status } = createErrorResponse(error, 'Failed to save tasks');
    return NextResponse.json(response, { status });
  }
}
