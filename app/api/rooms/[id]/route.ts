import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GetRoomResponse, UpdateRoomRequest, UpdateRoomResponse } from '@/types/api';
import { GameState } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ownerToken = request.headers.get('x-owner-token');

    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const isOwner = ownerToken === room.ownerId;

    const gameState: GameState = {
      players: room.players as any[],
      teamA: room.teamA as any[],
      teamB: room.teamB as any[],
      bench: room.bench as any[],
      currentMatch: room.currentMatch as any,
      matchHistory: room.matchHistory as any[],
    };

    const response: GetRoomResponse = {
      room: {
        id: room.id,
        name: room.name,
        ownerId: room.ownerId,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        gameState,
      },
      isOwner,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateRoomRequest = await request.json();
    const { gameState, ownerToken } = body;

    if (!ownerToken) {
      return NextResponse.json(
        { error: 'Owner token is required' },
        { status: 401 }
      );
    }

    // Find the room and verify ownership
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (room.ownerId !== ownerToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the room owner can edit' },
        { status: 403 }
      );
    }

    // Update the room with the new game state
    await prisma.room.update({
      where: { id },
      data: {
        players: gameState.players as any,
        teamA: gameState.teamA as any,
        teamB: gameState.teamB as any,
        bench: gameState.bench as any,
        currentMatch: gameState.currentMatch as any,
        matchHistory: gameState.matchHistory as any,
      },
    });

    const response: UpdateRoomResponse = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}
