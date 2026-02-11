"use client";

import { useState, useEffect, useCallback } from "react";
import { Player, GameState, Match } from "@/types";
import { loadGameState, saveGameState } from "@/utils/storage";
import {
  splitIntoTeams,
  rotateTeams,
  createMatch,
  generateId,
} from "@/utils/teamUtils";

const initialState: GameState = {
  players: [],
  teamA: [],
  teamB: [],
  bench: [],
  currentMatch: null,
  matchHistory: [],
};

export const useGameState = () => {
  const [state, setState] = useState<GameState>(() => {
    // Load initial state from localStorage if available
    const saved = loadGameState();
    return saved || initialState;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Mark as loaded after first render
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    setState((prev) => {
      // If there's an active match, add the new player to the bench
      const shouldAddToBench = prev.currentMatch !== null;

      return {
        ...prev,
        players: [...prev.players, newPlayer],
        bench: shouldAddToBench ? [...prev.bench, newPlayer] : prev.bench,
      };
    });
  }, []);

  const editPlayer = useCallback((id: string, name: string) => {
    setState((prev) => {
      const updatedName = name.trim();
      const updatePlayerName = (p: Player) =>
        p.id === id ? { ...p, name: updatedName } : p;

      return {
        ...prev,
        players: prev.players.map(updatePlayerName),
        teamA: prev.teamA.map(updatePlayerName),
        teamB: prev.teamB.map(updatePlayerName),
        bench: prev.bench.map(updatePlayerName),
      };
    });
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

  const shuffleAndSplit = useCallback(
    (playersPerTeam: number = 5) => {
      // Validate minimum players
      if (state.players.length < playersPerTeam * 2) {
        console.warn(
          `Not enough players. Need at least ${playersPerTeam * 2} players.`,
        );
        return;
      }

      const { teamA, teamB, bench } = splitIntoTeams(
        state.players,
        playersPerTeam,
      );

      // Additional validation: ensure teams have the right size
      if (teamA.length < playersPerTeam || teamB.length < playersPerTeam) {
        console.error("Failed to create complete teams");
        return;
      }

      const match = createMatch(teamA, teamB);

      setState((prev) => ({
        ...prev,
        teamA,
        teamB,
        bench,
        currentMatch: match,
      }));
    },
    [state.players],
  );

  const pickWinner = useCallback(
    (winner: "A" | "B") => {
      if (!state.currentMatch) return;

      const completedMatch: Match = {
        ...state.currentMatch,
        winner,
      };

      setState((prev) => ({
        ...prev,
        matchHistory: [completedMatch, ...prev.matchHistory],
        currentMatch: completedMatch,
      }));
    },
    [state.currentMatch],
  );

  const startNextMatch = useCallback(() => {
    if (!state.currentMatch || state.currentMatch.winner === null) return;

    const winner = state.currentMatch.winner;

    // Validate we have enough players to continue
    const totalPlayers =
      state.teamA.length + state.teamB.length + state.bench.length;
    const playersPerTeam = state.teamA.length;

    if (totalPlayers < playersPerTeam * 2) {
      console.error("Not enough players to continue matches");
      return;
    }

    const { teamA, teamB, bench } = rotateTeams(
      state.teamA,
      state.teamB,
      state.bench,
      winner,
    );

    // Validate rotation was successful
    if (teamA.length !== playersPerTeam || teamB.length !== playersPerTeam) {
      console.error("Failed to rotate teams properly");
      return;
    }

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
