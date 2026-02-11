export interface Player {
  id: string;
  name: string;
  rating?: number;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  winner: 'A' | 'B' | null;
  timestamp: number;
}

export interface GameState {
  players: Player[];
  teamA: Player[];
  teamB: Player[];
  bench: Player[];
  currentMatch: Match | null;
  matchHistory: Match[];
}
