import { Player, Team, Match } from '@/types';

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Split players into two teams and bench
 */
export const splitIntoTeams = (
  players: Player[],
  playersPerTeam: number = 5
): { teamA: Player[]; teamB: Player[]; bench: Player[] } => {
  const shuffled = shuffleArray(players);
  const teamA = shuffled.slice(0, playersPerTeam);
  const teamB = shuffled.slice(playersPerTeam, playersPerTeam * 2);
  const bench = shuffled.slice(playersPerTeam * 2);
  
  return { teamA, teamB, bench };
};

/**
 * Rotate teams after a match (loser to bench, bench players join winner)
 */
export const rotateTeams = (
  teamA: Player[],
  teamB: Player[],
  bench: Player[],
  winner: 'A' | 'B'
): { teamA: Player[]; teamB: Player[]; bench: Player[] } => {
  if (bench.length === 0) {
    // No rotation if no bench players
    return { teamA, teamB, bench };
  }

  const losingTeam = winner === 'A' ? teamB : teamA;
  const winningTeam = winner === 'A' ? teamA : teamB;
  
  // Number of players to rotate from bench
  const playersToRotate = Math.min(bench.length, losingTeam.length);
  
  // Take players from bench
  const newPlayers = bench.slice(0, playersToRotate);
  const remainingBench = [...bench.slice(playersToRotate), ...losingTeam];
  
  if (winner === 'A') {
    return {
      teamA: winningTeam,
      teamB: newPlayers,
      bench: remainingBench,
    };
  } else {
    return {
      teamA: newPlayers,
      teamB: winningTeam,
      bench: remainingBench,
    };
  }
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a match object
 */
export const createMatch = (
  teamA: Player[],
  teamB: Player[],
  winner: 'A' | 'B' | null = null
): Match => {
  return {
    id: generateId(),
    teamA: {
      id: 'team-a',
      name: 'Team A',
      players: teamA,
    },
    teamB: {
      id: 'team-b',
      name: 'Team B',
      players: teamB,
    },
    winner,
    timestamp: Date.now(),
  };
};
