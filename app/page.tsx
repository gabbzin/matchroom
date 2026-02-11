"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: roomName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const data = await response.json();

      // Store the owner token in localStorage
      localStorage.setItem(`room_${data.roomId}_token`, data.ownerToken);

      // Navigate to the room
      router.push(`/rooms/${data.roomId}`);
    } catch (err) {
      setError("Erro ao criar sala. Tente novamente.");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/rooms/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-800 mb-4">
            ⚽ Match Room
          </h1>
          <p className="text-xl text-gray-600">
            Sistema de Gerenciamento de Partidas
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Room */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Criar Nova Sala
            </h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label
                  htmlFor="roomName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nome da Sala
                </label>
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Ex: Pelada do Sábado"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                disabled={isCreating}
                className={`w-full py-3 rounded-lg font-bold text-lg ${
                  isCreating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } text-white transition-colors`}
              >
                {isCreating ? "Criando..." : "Criar Sala"}
              </button>
            </form>
          </div>

          {/* Join Room */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Entrar em uma Sala
            </h2>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ID da Sala
                </label>
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Cole o ID da sala aqui"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-lg transition-colors"
              >
                Entrar na Sala
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">
            💡 <strong>Dica:</strong> Como dono da sala, você pode editar as
            informações.
          </p>
          <p>
            Compartilhe o ID da sala com outros jogadores para que eles possam
            visualizar!
          </p>
        </div>
      </div>
    </div>
  );
}
