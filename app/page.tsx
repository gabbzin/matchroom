'use client';

import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import AddPlayerForm from '@/components/AddPlayerForm';
import PlayerList from '@/components/PlayerList';
import TeamDisplay from '@/components/TeamDisplay';
import CurrentMatch from '@/components/CurrentMatch';
import MatchHistory from '@/components/MatchHistory';

export default function Home() {
  const {
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
  } = useGameState();

  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [activeTab, setActiveTab] = useState<'setup' | 'match' | 'history'>('setup');

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const canStartMatch = state.players.length >= playersPerTeam * 2;
  const hasActiveMatch = state.currentMatch !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
            ⚽ Fut Evolução
          </h1>
          <p className="text-gray-600">Soccer Match Management System</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'setup'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('match')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'match'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Match
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            History ({state.matchHistory.length})
          </button>
        </div>

        {/* Setup Tab */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Add Players</h2>
              <AddPlayerForm onAdd={addPlayer} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">
                Players List ({state.players.length})
              </h2>
              <PlayerList
                players={state.players}
                onEdit={editPlayer}
                onRemove={removePlayer}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Team Settings</h2>
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium">Players per team:</label>
                <input
                  type="number"
                  min="1"
                  max="11"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(parseInt(e.target.value) || 5)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => shuffleAndSplit(playersPerTeam)}
                disabled={!canStartMatch}
                className={`w-full py-3 rounded-lg font-bold text-lg ${
                  canStartMatch
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canStartMatch
                  ? '🔀 Shuffle & Split Teams'
                  : `Need at least ${playersPerTeam * 2} players`}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="flex-1 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
              >
                Reset Match (Keep Players)
              </button>
              <button
                onClick={clearAllData}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                Clear All Data
              </button>
            </div>
          </div>
        )}

        {/* Match Tab */}
        {activeTab === 'match' && (
          <div className="space-y-6">
            <CurrentMatch
              match={state.currentMatch}
              onPickWinner={pickWinner}
              onStartNext={startNextMatch}
            />

            {hasActiveMatch && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TeamDisplay
                  title="Team A"
                  players={state.teamA}
                  color="blue"
                />
                <TeamDisplay
                  title="Bench"
                  players={state.bench}
                  color="gray"
                />
                <TeamDisplay
                  title="Team B"
                  players={state.teamB}
                  color="red"
                />
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Match History</h2>
            <MatchHistory matches={state.matchHistory} />
          </div>
        )}
      </div>
    </div>
  );
}
