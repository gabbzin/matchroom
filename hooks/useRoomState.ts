"use client";

import { useState, useEffect, useCallback } from "react";
import { Player, GameState, Match } from "@/types";
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

interface UseRoomStateProps {
  roomId: string;
}

export const useRoomState = ({ roomId }: UseRoomStateProps) => {
  const [state, setState] = useState<GameState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get owner token from localStorage
  const getOwnerToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`room_${roomId}_token`);
  }, [roomId]);

  // Load room data from API
  const loadRoomData = useCallback(async () => {
    try {
      const ownerToken = getOwnerToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (ownerToken) {
        headers["x-owner-token"] = ownerToken;
      }

      const response = await fetch(`/api/rooms/${roomId}`, { headers });

      if (!response.ok) {
        throw new Error("Failed to load room");
      }

      const data = await response.json();
      setState(data.room.gameState);
      setIsOwner(data.isOwner);
      setRoomName(data.room.name);
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error("Error loading room:", err);
      setError("Erro ao carregar sala");
      setIsLoaded(true);
    }
  }, [roomId, getOwnerToken]);

  // Save state to API
  const saveState = useCallback(
    async (newState: GameState) => {
      if (!isOwner) return;

      const ownerToken = getOwnerToken();
      if (!ownerToken) return;

      try {
        const response = await fetch(`/api/rooms/${roomId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameState: newState,
            ownerToken,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save state");
        }
      } catch (err) {
        console.error("Error saving state:", err);
        setError("Erro ao salvar alterações");
      }
    },
    [roomId, isOwner, getOwnerToken],
  );

  // Load initial data
  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  // Update state and save to API
  const updateState = useCallback(
    (updater: (prev: GameState) => GameState) => {
      setState((prev) => {
        const newState = updater(prev);
        // Save to API asynchronously
        if (isOwner) {
          saveState(newState);
        }
        return newState;
      });
    },
    [isOwner, saveState],
  );

  const addPlayer = useCallback(
    (name: string) => {
      if (!isOwner) return;

      const newPlayer: Player = {
        id: generateId(),
        name: name.trim(),
      };

      updateState((prev) => {
        const shouldAddToBench = prev.currentMatch !== null;
        return {
          ...prev,
          players: [...prev.players, newPlayer],
          bench: shouldAddToBench ? [...prev.bench, newPlayer] : prev.bench,
        };
      });
    },
    [isOwner, updateState],
  );

  const editPlayer = useCallback(
    (id: string, name: string) => {
      if (!isOwner) return;

      updateState((prev) => {
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
    },
    [isOwner, updateState],
  );

  const removePlayer = useCallback(
    (id: string) => {
      if (!isOwner) return;

      updateState((prev) => {
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
    },
    [isOwner, updateState],
  );

  const shuffleAndSplit = useCallback(
    (playersPerTeam: number = 5) => {
      if (!isOwner) return;

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

      if (teamA.length < playersPerTeam || teamB.length < playersPerTeam) {
        console.error("Failed to create complete teams");
        return;
      }

      const match = createMatch(teamA, teamB);

      updateState((prev) => ({
        ...prev,
        teamA,
        teamB,
        bench,
        currentMatch: match,
      }));
    },
    [state.players, isOwner, updateState],
  );

  const pickWinner = useCallback(
    (winner: "A" | "B") => {
      if (!isOwner || !state.currentMatch) return;

      const completedMatch: Match = {
        ...state.currentMatch,
        winner,
      };

      updateState((prev) => ({
        ...prev,
        matchHistory: [completedMatch, ...prev.matchHistory],
        currentMatch: completedMatch,
      }));
    },
    [state.currentMatch, isOwner, updateState],
  );

  const startNextMatch = useCallback(() => {
    if (!isOwner || !state.currentMatch || state.currentMatch.winner === null)
      return;

    const winner = state.currentMatch.winner;
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

    if (teamA.length !== playersPerTeam || teamB.length !== playersPerTeam) {
      console.error("Failed to rotate teams properly");
      return;
    }

    const newMatch = createMatch(teamA, teamB);

    updateState((prev) => ({
      ...prev,
      teamA,
      teamB,
      bench,
      currentMatch: newMatch,
    }));
  }, [
    state.currentMatch,
    state.teamA,
    state.teamB,
    state.bench,
    isOwner,
    updateState,
  ]);

  const resetGame = useCallback(() => {
    if (!isOwner) return;

    updateState((prev) => ({
      ...initialState,
      players: prev.players,
    }));
  }, [isOwner, updateState]);

  const clearAllData = useCallback(() => {
    if (!isOwner) return;

    updateState(() => initialState);
  }, [isOwner, updateState]);

  const refreshRoom = useCallback(() => {
    loadRoomData();
  }, [loadRoomData]);

  return {
    state,
    isLoaded,
    isOwner,
    roomName,
    error,
    addPlayer,
    editPlayer,
    removePlayer,
    shuffleAndSplit,
    pickWinner,
    startNextMatch,
    resetGame,
    clearAllData,
    refreshRoom,
  };
};
