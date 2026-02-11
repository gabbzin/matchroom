"use client";

import { Match } from "@/types";

interface CurrentMatchProps {
  match: Match | null;
  onPickWinner?: (winner: "A" | "B") => void;
  onStartNext?: () => void;
}

export default function CurrentMatch({
  match,
  onPickWinner,
  onStartNext,
}: CurrentMatchProps) {
  if (!match) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
        Nenhuma partida ativa. Sorteie e divida os jogadores para começar!
      </div>
    );
  }

  const hasWinner = match.winner !== null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-2xl font-bold text-center mb-6">Partida Atual</h3>

      <div className="grid grid-cols-3 gap-4 items-center mb-6">
        <div className="text-center">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h4 className="text-xl font-bold text-blue-700 mb-2">Time A</h4>
            <ul className="space-y-1">
              {match.teamA.players.map((player) => (
                <li key={player.id} className="text-sm">
                  {player.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-gray-700">VS</div>
        </div>

        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg">
            <h4 className="text-xl font-bold text-red-700 mb-2">Time B</h4>
            <ul className="space-y-1">
              {match.teamB.players.map((player) => (
                <li key={player.id} className="text-sm">
                  {player.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {!hasWinner ? (
        onPickWinner ? (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onPickWinner("A")}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-lg"
            >
              Time A Venceu
            </button>
            <button
              onClick={() => onPickWinner("B")}
              className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-lg"
            >
              Time B Venceu
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Aguardando o dono escolher o vencedor...
          </div>
        )
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <span className="text-xl font-bold text-green-600">
              Time {match.winner} Venceu! 🎉
            </span>
          </div>
          {onStartNext && (
            <button
              onClick={onStartNext}
              className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-lg"
            >
              Iniciar Próxima Partida
            </button>
          )}
          {!onStartNext && (
            <div className="text-gray-500">
              Aguardando o dono iniciar a próxima partida...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
