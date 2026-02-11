import { GameState } from './index';
import { Prisma } from '@prisma/client';

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  gameState: GameState;
}

export interface CreateRoomRequest {
  name: string;
}

export interface CreateRoomResponse {
  roomId: string;
  ownerToken: string;
}

export interface GetRoomResponse {
  room: Room;
  isOwner: boolean;
}

export interface UpdateRoomRequest {
  gameState: GameState;
  ownerToken: string;
}

export interface UpdateRoomResponse {
  success: boolean;
}

// Helper type for JSON fields
export type JsonValue = Prisma.JsonValue;
