"use client";

import { Player } from "@/types";
import { useState } from "react";

interface PlayerListProps {
  players: Player[];
  onEdit?: (id: string, name: string) => void;
  onRemove?: (id: string) => void;
}

export default function PlayerList({
  players,
  onEdit,
  onRemove,
}: PlayerListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim() && onEdit) {
      onEdit(editingId, editName);
      setEditingId(null);
      setEditName("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  if (players.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Nenhum jogador adicionado ainda. Adicione seu primeiro jogador acima!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player) => (
        <div
          key={player.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg shadow"
        >
          {editingId === player.id ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
              />
              <button
                onClick={saveEdit}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Salvar
              </button>
              <button
                onClick={cancelEdit}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <span className="font-medium">{player.name}</span>
              {(onEdit || onRemove) && (
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => startEdit(player)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Editar
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(player.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remover
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
