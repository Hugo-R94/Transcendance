import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUserAvatar } from '../../api/getUserAvatar';
import type { Friend } from '../../api/chat';
import DropdownMenu from '../DropdownMenu';
import Notification from '../notification';

function PlayerAvatar({
  playerId,
  username,
}: {
  playerId: string;
  username: string;
}) {
  const avatarUrl = useUserAvatar(playerId);

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/20 flex items-center justify-center font-bold text-white text-sm bg-black/20 shadow-md">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{username?.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

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
  friends: Friend[];

  connect: () => void;
  disconnect: () => void;
  joinRoom: () => void;
  joinRoomByID: (roomId: string) => void;
  leaveRoom: () => void;
  invite: (friendId: string, roomId: string) => void;
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
  friends,
  connect,
  disconnect,
  joinRoom,
  joinRoomByID,
  leaveRoom,
  invite,
  toggleReady,
}: LobbyProps) {
  const colors = [
    'bg-byellow',
    'bg-bred',
    'bg-bblue',
  ];

  const [searchParams] = useSearchParams();
  const roomFromUrl = searchParams.get('room');

  // Connexion automatique au chargement
  useEffect(() => {
    if (!connected) {
      connect();
    }
  }, []);

  // ATTEND que connected passe à true avant de rejoindre la room
  useEffect(() => {
    if (!connected) {
      return;
    }

    if (!roomFromUrl) {
      return;
    }

    if (joined) {
      return;
    }

    console.log('WebSocket connecté');
    console.log('Room trouvée dans URL :', roomFromUrl);
    console.log('Join de la room...');

    setRoomId(roomFromUrl);
    joinRoomByID(roomFromUrl);
  }, [connected]);

  console.log('connected =', connected);
  console.log('joined =', joined);
  console.log('roomFromUrl =', roomFromUrl);
  console.log('friends reçus dans Lobby :', friends);

  return (
    <div className="w-full p-6 text-white">
      <div className="mx-auto max-w-3xl flex flex-col justify-center items-center">

        <h1 className="mb-6 text-3xl font-black">
          LOBBY
        </h1>

		{error && (
			<Notification
				message={error}
				onClose={() => {
				}}
			/>
			)}

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

        <div className="mb-6 rounded-2xl bg-bdarkgreen aspect-[2/3] outline-10 md:90 sm:w-90 w-65 p-6 shadow-black/75 shadow-2xl">

          {/* CONNEXION AUTOMATIQUE */}

          {connected && (
            <div className="mb-3">
              <span className="text-green-400">
                ● Connecté
              </span>
            </div>
          )}

          {!connected && (
            <div className="mb-3">
              <span className="text-yellow-400">
                ● Connexion...
              </span>
            </div>
          )}

          {/* ROOM */}

          <div className="flex flex-col gap-3">

            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Nom de la room"
              disabled={joined}
              className="flex-1 rounded-xl bg-slate-800 px-4 py-3 outline-none"
            />

            {connected && !joined && (
              <button
                onClick={joinRoom}
                className="rounded-xl bg-blue-600 px-6 py-3 font-black hover:bg-blue-500"
              >
                REJOINDRE
              </button>
            )}

          </div>

          {/* ROOM */}

          {joined && (
            <div className="rounded-2xl p-3">

              {/* INVITE / LEAVE */}

              <div className="flex w-full h-12 gap-x-1 mb-3">

                <DropdownMenu
                  className="w-1/2 h-full"
                  color="bg-byellow"
                  items={friends.map((f) => ({
                    label: f.username,
                    onClick: () => {
                      console.log('friend id =', f.id);
                      invite(f.id, roomId);
                    },
                  }))}
                >
                  INVITE
                </DropdownMenu>

                <button
                  onClick={leaveRoom}
                  className="bg-bred balatro rounded-2xl p-2 w-1/2 shadow-black/75 shadow-md hover:outline-3 hover:z-50"
                >
                  LEAVE
                </button>

              </div>

              {/* HEADER */}

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-black">
                    Joueurs
                  </h2>

                  <p className="text-sm text-slate-500">
                    {players.filter((p) => p.ready).length}
                    {' / '}
                    {players.length} prêts
                  </p>
                </div>

                <button
                  onClick={toggleReady}
                  className={`rounded-xl px-6 py-3 font-black balatro shadow-md shadow-black/75 hover:outline-3 hover:z-50 ${
                    ready
                      ? 'bg-bgreen'
                      : 'bg-bblue'
                  }`}
                >
                  {ready ? 'READY' : 'NOT READY'}
                </button>

              </div>

              {/* JOUEURS */}

              <div className="space-y-3">

                {players.length === 0 && (
                  <div className="rounded-xl bg-slate-800 p-6 text-center text-slate-500">
                    Aucun joueur
                  </div>
                )}

                {players.map((player, index) => {
                  const bgColor = colors[index % colors.length];

                  return (
                    <div
                      key={player.playerId}
                      className={`flex  items-center gap-3 rounded-xl ${bgColor} p-3 shadow-md`}
                    >

                      {/* AVATAR */}

                      <PlayerAvatar
                        playerId={player.playerId}
                        username={player.username}
                      />

                      {/* USERNAME */}

                      <div className="min-w-0 flex-1">
                        <div className="font-black truncate">
                          {player.username}

                          {player.playerId === playerId && (
                            <span className="ml-1 text-bblue">
                              (toi)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* STATUS */}

                      <div
                        className={`shrink-0 font-black ${
                          player.ready
                            ? 'text-bgreen'
                            : 'text-white/50'
                        }`}
                      >
                        {player.ready
                          ? 'READY'
                          : 'WAITING'}
                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
