"use client";

import { useState, use, useEffect } from "react";
import { useRoomState } from "@/hooks/useRoomState";
import AddPlayerForm from "@/components/AddPlayerForm";
import PlayerList from "@/components/PlayerList";
import TeamDisplay from "@/components/TeamDisplay";
import CurrentMatch from "@/components/CurrentMatch";
import MatchHistory from "@/components/MatchHistory";
import { useRouter } from "next/navigation";

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
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
  } = useRoomState({ roomId: id });

  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [activeTab, setActiveTab] = useState<"setup" | "match" | "history">(
    "setup",
  );
  const [showCopied, setShowCopied] = useState(false);

  // Update document title with room name
  useEffect(() => {
    if (roomName) {
      document.title = roomName;
    }
  }, [roomName]);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(id);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleShareRoom = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando sala...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Voltar para Home
          </button>
        </div>
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
            ⚽ {roomName}
          </h1>
          <p className="text-gray-600">Sistema de Gerenciamento de Partidas</p>

          {/* Room Info */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-sm text-gray-600">ID da Sala:</span>
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {id}
              </code>
              <button
                onClick={handleCopyRoomId}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                📋
              </button>
            </div>

            <button
              onClick={handleShareRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
            >
              Compartilhar Sala
            </button>

            <button
              onClick={refreshRoom}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
            >
              🔄 Atualizar
            </button>

            {isOwner && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                👑 Dono
              </span>
            )}
            {!isOwner && (
              <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                👁️ Visualizador
              </span>
            )}
          </div>

          {showCopied && (
            <div className="mt-2 text-green-600 text-sm">
              ✓ Copiado para área de transferência!
            </div>
          )}
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("setup")}
            className={`px-6 py-3 font-medium ${
              activeTab === "setup"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Configuração
          </button>
          <button
            onClick={() => setActiveTab("match")}
            className={`px-6 py-3 font-medium ${
              activeTab === "match"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Partida
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-medium ${
              activeTab === "history"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Histórico ({state.matchHistory.length})
          </button>
        </div>

        {/* Setup Tab */}
        {activeTab === "setup" && (
          <div className="space-y-6">
            {!isOwner && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
                <p className="font-medium">
                  ⚠️ Você está visualizando esta sala. Apenas o dono pode fazer
                  alterações.
                </p>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Adicionar Jogadores</h2>
              {isOwner ? (
                <AddPlayerForm onAdd={addPlayer} />
              ) : (
                <p className="text-gray-500">
                  Apenas o dono pode adicionar jogadores.
                </p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">
                Lista de Jogadores ({state.players.length})
              </h2>
              <PlayerList
                players={state.players}
                onEdit={isOwner ? editPlayer : undefined}
                onRemove={isOwner ? removePlayer : undefined}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">
                Configurações dos Times
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium">Jogadores por time:</label>
                <input
                  type="number"
                  min="1"
                  max="11"
                  value={playersPerTeam}
                  onChange={(e) =>
                    setPlayersPerTeam(parseInt(e.target.value) || 5)
                  }
                  disabled={!isOwner}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <button
                onClick={() => shuffleAndSplit(playersPerTeam)}
                disabled={!canStartMatch || !isOwner}
                className={`w-full py-3 rounded-lg font-bold text-lg ${
                  canStartMatch && isOwner
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {!isOwner
                  ? "Apenas o dono pode sortear times"
                  : canStartMatch
                    ? "🔀 Sortear e Dividir Times"
                    : `Precisa de pelo menos ${playersPerTeam * 2} jogadores`}
              </button>
            </div>

            {isOwner && (
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                >
                  Resetar Partidas (Manter Jogadores)
                </button>
                <button
                  onClick={clearAllData}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  Limpar Todos os Dados
                </button>
              </div>
            )}
          </div>
        )}

        {/* Match Tab */}
        {activeTab === "match" && (
          <div className="space-y-6">
            <CurrentMatch
              match={state.currentMatch}
              onPickWinner={isOwner ? pickWinner : undefined}
              onStartNext={isOwner ? startNextMatch : undefined}
            />

            {hasActiveMatch && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TeamDisplay
                  title="Time A"
                  players={state.teamA}
                  color="blue"
                />
                <TeamDisplay title="Banco" players={state.bench} color="gray" />
                <TeamDisplay title="Time B" players={state.teamB} color="red" />
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Histórico de Partidas</h2>
            <MatchHistory matches={state.matchHistory} />
          </div>
        )}
      </div>
    </div>
  );
}
