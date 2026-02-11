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

      // Also update currentMatch if it exists
      let updatedCurrentMatch = prev.currentMatch;
      if (updatedCurrentMatch) {
        updatedCurrentMatch = {
          ...updatedCurrentMatch,
          teamA: {
            ...updatedCurrentMatch.teamA,
            players: updatedCurrentMatch.teamA.players.map(updatePlayerName),
          },
          teamB: {
            ...updatedCurrentMatch.teamB,
            players: updatedCurrentMatch.teamB.players.map(updatePlayerName),
          },
        };
      }

      return {
        ...prev,
        players: prev.players.map(updatePlayerName),
        teamA: prev.teamA.map(updatePlayerName),
        teamB: prev.teamB.map(updatePlayerName),
        bench: prev.bench.map(updatePlayerName),
        currentMatch: updatedCurrentMatch,
      };
    });
  }, []);

  const removePlayer = useCallback((id: string) => {
    setState((prev) => {
      const newPlayers = prev.players.filter((p) => p.id !== id);
      let newTeamA = prev.teamA.filter((p) => p.id !== id);
      let newTeamB = prev.teamB.filter((p) => p.id !== id);
      let newBench = prev.bench.filter((p) => p.id !== id);
      let updatedCurrentMatch = prev.currentMatch;

      // Check if we removed a player from an active team
      const removedFromTeamA = prev.teamA.length !== newTeamA.length;
      const removedFromTeamB = prev.teamB.length !== newTeamB.length;
      const hasActiveMatch = prev.currentMatch !== null;

      // If removed from active team during a match, rebalance teams
      if (hasActiveMatch && (removedFromTeamA || removedFromTeamB)) {
        const targetSize = Math.min(newTeamA.length, newTeamB.length);

        // If teams are now unbalanced, try to rebalance
        if (newTeamA.length !== newTeamB.length) {
          // Try to balance by moving players from larger team to bench
          if (newTeamA.length > newTeamB.length) {
            const excess = newTeamA.slice(targetSize);
            newTeamA = newTeamA.slice(0, targetSize);
            newBench = [...newBench, ...excess];
          } else if (newTeamB.length > newTeamA.length) {
            const excess = newTeamB.slice(targetSize);
            newTeamB = newTeamB.slice(0, targetSize);
            newBench = [...newBench, ...excess];
          }
        }

        // Update currentMatch with new player lists
        if (updatedCurrentMatch) {
          updatedCurrentMatch = {
            ...updatedCurrentMatch,
            teamA: {
              ...updatedCurrentMatch.teamA,
              players: newTeamA,
            },
            teamB: {
              ...updatedCurrentMatch.teamB,
              players: newTeamB,
            },
          };
        }
      } else if (updatedCurrentMatch) {
        // Just update currentMatch if removed from bench
        updatedCurrentMatch = {
          ...updatedCurrentMatch,
          teamA: {
            ...updatedCurrentMatch.teamA,
            players: updatedCurrentMatch.teamA.players.filter(
              (p) => p.id !== id,
            ),
          },
          teamB: {
            ...updatedCurrentMatch.teamB,
            players: updatedCurrentMatch.teamB.players.filter(
              (p) => p.id !== id,
            ),
          },
        };
      }

      return {
        ...prev,
        players: newPlayers,
        teamA: newTeamA,
        teamB: newTeamB,
        bench: newBench,
        currentMatch: updatedCurrentMatch,
      };
    });
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

    // Use the minimum team size as reference (in case they are unbalanced)
    const playersPerTeam = Math.min(state.teamA.length, state.teamB.length);

    // Need at least enough players for 2 complete teams
    if (totalPlayers < playersPerTeam * 2 || playersPerTeam === 0) {
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
