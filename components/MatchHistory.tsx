'use client';

import { Match } from '@/types';

interface MatchHistoryProps {
  matches: Match[];
}

export default function MatchHistory({ matches }: MatchHistoryProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No match history yet. Start playing matches!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match, index) => (
        <div
          key={match.id}
          className="bg-white p-4 rounded-lg shadow"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              Match #{matches.length - index}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(match.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className={`text-center p-2 rounded ${match.winner === 'A' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'}`}>
              <div className="font-bold text-blue-700">Team A</div>
              <div className="text-xs text-gray-600 mt-1">
                {match.teamA.players.map(p => p.name).join(', ')}
              </div>
            </div>
            <div className="text-center font-bold text-2xl">
              VS
            </div>
            <div className={`text-center p-2 rounded ${match.winner === 'B' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'}`}>
              <div className="font-bold text-red-700">Team B</div>
              <div className="text-xs text-gray-600 mt-1">
                {match.teamB.players.map(p => p.name).join(', ')}
              </div>
            </div>
          </div>
          {match.winner && (
            <div className="mt-2 text-center font-medium text-green-600">
              Winner: Team {match.winner}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
