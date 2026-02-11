import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { CreateRoomRequest, CreateRoomResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: CreateRoomRequest = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Generate a unique owner token
    const ownerToken = nanoid(32);

    // Create the room with initial empty game state
    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        ownerId: ownerToken,
        players: [],
        teamA: [],
        teamB: [],
        bench: [],
        currentMatch: null,
        matchHistory: [],
      },
    });

    const response: CreateRoomResponse = {
      roomId: room.id,
      ownerToken: ownerToken,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
