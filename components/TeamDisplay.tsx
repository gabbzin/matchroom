"use client";

import { Player } from "@/types";

interface TeamDisplayProps {
  title: string;
  players: Player[];
  color: "blue" | "red" | "gray";
}

export default function TeamDisplay({
  title,
  players,
  color,
}: TeamDisplayProps) {
  const colorClasses = {
    blue: "bg-blue-100 border-blue-500",
    red: "bg-red-100 border-red-500",
    gray: "bg-gray-100 border-gray-500",
  };

  const titleColorClasses = {
    blue: "text-blue-700",
    red: "text-red-700",
    gray: "text-gray-700",
  };

  return (
    <div className={`border-2 ${colorClasses[color]} rounded-lg p-4`}>
      <h3 className={`text-xl font-bold mb-3 ${titleColorClasses[color]}`}>
        {title}
      </h3>
      {players.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum jogador</p>
      ) : (
        <ul className="space-y-2">
          {players.map((player, index) => (
            <li
              key={player.id}
              className="bg-white px-3 py-2 rounded shadow-sm"
            >
              {index + 1}. {player.name}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 text-sm text-gray-600 font-medium">
        Total: {players.length} jogadores
      </div>
    </div>
  );
}
