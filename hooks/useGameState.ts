'use client';

import { useState, useEffect, useCallback } from 'react';
import { Player, GameState, Match } from '@/types';
import { loadGameState, saveGameState } from '@/utils/storage';
import { splitIntoTeams, rotateTeams, createMatch, generateId } from '@/utils/teamUtils';

const initialState: GameState = {
  players: [],
  teamA: [],
  teamB: [],
  bench: [],
  currentMatch: null,
  matchHistory: [],
};

export const useGameState = () => {
  const [state, setState] = useState<GameState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setState(saved);
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveGameState(state);
    }
  }, [state, isLoaded]);

  const addPlayer = useCallback((name: string) => {
    const newPlayer: Player = {
      id: generateId(),
      name: name.trim(),
    };
    setState((prev) => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
  }, []);

  const editPlayer = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === id ? { ...p, name: name.trim() } : p
      ),
    }));
  }, []);

  const removePlayer = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
      teamA: prev.teamA.filter((p) => p.id !== id),
      teamB: prev.teamB.filter((p) => p.id !== id),
      bench: prev.bench.filter((p) => p.id !== id),
    }));
  }, []);

  const shuffleAndSplit = useCallback((playersPerTeam: number = 5) => {
    const { teamA, teamB, bench } = splitIntoTeams(state.players, playersPerTeam);
    const match = createMatch(teamA, teamB);
    
    setState((prev) => ({
      ...prev,
      teamA,
      teamB,
      bench,
      currentMatch: match,
    }));
  }, [state.players]);

  const pickWinner = useCallback((winner: 'A' | 'B') => {
    if (!state.currentMatch) return;

    const completedMatch: Match = {
      ...state.currentMatch,
      winner,
    };

    setState((prev) => ({
      ...prev,
      matchHistory: [completedMatch, ...prev.matchHistory],
      currentMatch: null,
    }));
  }, [state.currentMatch]);

  const startNextMatch = useCallback(() => {
    if (!state.currentMatch || state.currentMatch.winner === null) return;

    const winner = state.currentMatch.winner;
    const { teamA, teamB, bench } = rotateTeams(
      state.teamA,
      state.teamB,
      state.bench,
      winner
    );

    const newMatch = createMatch(teamA, teamB);

    setState((prev) => ({
      ...prev,
      teamA,
      teamB,
      bench,
      currentMatch: newMatch,
    }));
  }, [state.currentMatch, state.teamA, state.teamB, state.bench]);

  const resetGame = useCallback(() => {
    setState((prev) => ({
      ...initialState,
      players: prev.players, // Keep players
    }));
  }, []);

  const clearAllData = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    isLoaded,
    addPlayer,
    editPlayer,
    removePlayer,
    shuffleAndSplit,
    pickWinner,
    startNextMatch,
    resetGame,
    clearAllData,
  };
};
