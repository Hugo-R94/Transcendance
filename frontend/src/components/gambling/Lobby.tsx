import React from 'react';

type Player = {
  playerId: string;
  username: string;
  balance: number;
  ready: boolean;
};

type LobbyProps = {
  connected: boolean;
  joined: boolean;

  roomId: string;
  setRoomId: (value: string) => void;

  players: Player[];
  playerId: string;

  ready: boolean;
  countdown: number | null;

  error: string;

  connect: () => void;
  disconnect: () => void;
  joinRoom: () => void;
  toggleReady: () => void;
};

export default function Lobby({
  connected,
  joined,
  roomId,
  setRoomId,
  players,
  playerId,
  ready,
  countdown,
  error,
  connect,
  disconnect,
  joinRoom,
  toggleReady,
}: LobbyProps) {
  return (
    <div className="w-full p-6 text-white">

      <div className="mx-auto max-w-4xl">

        <h1 className="mb-6 text-3xl font-black">
          LOBBY
        </h1>

        {/* ERREUR */}

        {error && (
          <div className="mb-4 rounded-xl bg-red-900 p-4 text-red-200">
            {error}
          </div>
        )}

        {/* COUNTDOWN */}

        {countdown !== null && (
          <div className="mb-4 rounded-xl bg-yellow-900 p-4 text-center">
            <div className="text-sm font-bold text-yellow-300">
              LA PARTIE COMMENCE DANS
            </div>

            <div className="text-4xl font-black text-white">
              {countdown}
            </div>
          </div>
        )}

        {/* CONNEXION */}

        <div className="mb-6 rounded-2xl bg-slate-900 p-6">

          <h2 className="mb-4 text-xl font-black">
            Connexion
          </h2>

          <div className="flex flex-col gap-3 md:flex-row">

            <input
              value={roomId}
              onChange={(e) =>
                setRoomId(e.target.value)
              }
              placeholder="Nom de la room"
              disabled={joined}
              className="flex-1 rounded-xl bg-slate-800 px-4 py-3 outline-none"
            />

            {!connected ? (
              <button
                onClick={connect}
                className="rounded-xl bg-green-600 px-6 py-3 font-black hover:bg-green-500"
              >
                CONNECTER
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="rounded-xl bg-red-600 px-6 py-3 font-black hover:bg-red-500"
              >
                DÉCONNECTER
              </button>
            )}

            <button
              onClick={joinRoom}
              disabled={!connected || joined}
              className="rounded-xl bg-blue-600 px-6 py-3 font-black hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              REJOINDRE
            </button>

          </div>

          <div className="mt-4 text-sm">
            {connected ? (
              <span className="text-green-400">
                ● Connecté
              </span>
            ) : (
              <span className="text-red-400">
                ● Déconnecté
              </span>
            )}
          </div>

        </div>

        {/* ROOM */}

        {joined && (
          <div className="rounded-2xl bg-slate-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-black">
                  Joueurs
                </h2>

                <p className="text-sm text-slate-500">
                  {players.filter(
                    (p) => p.ready
                  ).length}
                  {" / "}
                  {players.length} prêts
                </p>
              </div>

              <button
                onClick={toggleReady}
                className={`rounded-xl px-6 py-3 font-black ${
                  ready
                    ? "bg-green-600"
                    : "bg-slate-700"
                }`}
              >
                {ready
                  ? "✓ READY"
                  : "READY"}
              </button>

            </div>

            {/* JOUEURS */}

            <div className="space-y-3">

              {players.length === 0 && (
                <div className="rounded-xl bg-slate-800 p-6 text-center text-slate-500">
                  Aucun joueur
                </div>
              )}

              {players.map((player) => (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between rounded-xl bg-slate-800 p-4"
                >

                  <div>
                    <div className="font-black">
                      {player.username}

                      {player.playerId === playerId && (
                        <span className="ml-2 text-blue-400">
                          (toi)
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={
                      player.ready
                        ? "font-black text-green-400"
                        : "text-slate-500"
                    }
                  >
                    {player.ready
                      ? "✓ READY"
                      : "WAITING"}
                  </div>

                </div>
              ))}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}