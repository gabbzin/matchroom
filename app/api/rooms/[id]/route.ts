import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GetRoomResponse, UpdateRoomRequest, UpdateRoomResponse } from '@/types/api';
import { GameState, Player, Match } from '@/types';
import { Prisma } from '@prisma/client';

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
      players: room.players as unknown as Player[],
      teamA: room.teamA as unknown as Player[],
      teamB: room.teamB as unknown as Player[],
      bench: room.bench as unknown as Player[],
      currentMatch: room.currentMatch as unknown as Match | null,
      matchHistory: room.matchHistory as unknown as Match[],
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
        players: gameState.players as unknown as Prisma.JsonArray,
        teamA: gameState.teamA as unknown as Prisma.JsonArray,
        teamB: gameState.teamB as unknown as Prisma.JsonArray,
        bench: gameState.bench as unknown as Prisma.JsonArray,
        currentMatch: (gameState.currentMatch === null ? Prisma.JsonNull : gameState.currentMatch) as unknown as Prisma.InputJsonValue,
        matchHistory: gameState.matchHistory as unknown as Prisma.JsonArray,
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
