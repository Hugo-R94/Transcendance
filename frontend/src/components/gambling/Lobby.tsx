import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useUserAvatar } from "../../api/getUserAvatar";
import type { Friend } from "../../api/chat";

import DropdownMenu from "../utils/DropdownMenu";
import Notification from "../utils/notification";

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

function PlayerAvatar({
  playerId,
  username,
}: {
  playerId: string;
  username: string;
}) {
  const avatarUrl = useUserAvatar(playerId);

  return (
    <div className="w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-black/20 text-sm font-bold text-white shadow-md">
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
  joinRoom,
  joinRoomByID,
  leaveRoom,
  invite,
  toggleReady,
}: LobbyProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const roomFromUrl = searchParams.get("room");

  const colors = [
    "bg-byellow",
    "bg-bred",
    "bg-bblue",
  ];

  useEffect(() => {
    if (!connected) {
      connect();
    }
  }, []);

  useEffect(() => {
    if (!connected || !roomFromUrl || joined) {
      return;
    }

    console.log("WebSocket connecté");
    console.log("Room trouvée dans URL :", roomFromUrl);
    console.log("Join de la room...");

    setRoomId(roomFromUrl);
    joinRoomByID(roomFromUrl);
  }, [connected]);

  console.log("connected =", connected);
  console.log("joined =", joined);
  console.log("roomFromUrl =", roomFromUrl);
  console.log("friends reçus dans Lobby :", friends);

  return (
    <div className="w-full p-6 text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center">
        <h1 className="mb-6 text-3xl font-black">
          {t("lobby.title")}
        </h1>

        {error && (
          <Notification
            message={error}
            onClose={() => {}}
          />
        )}

        {countdown !== null && (
          <div className="mb-4 rounded-xl bg-yellow-900 p-4 text-center">
            <div className="text-sm font-bold text-yellow-300">
              {t("lobby.startingIn")}
            </div>

            <div className="text-4xl font-black text-white">
              {countdown}
            </div>
          </div>
        )}

        <div className="mb-6 aspect-[2/3] w-65 rounded-2xl bg-bdarkgreen p-6 shadow-2xl shadow-black/75 outline-10 sm:w-90 md:90">
          <div className="mb-3">
            <span
              className={
                connected
                  ? "text-green-400"
                  : "text-yellow-400"
              }
            >
              ● {connected ? t("lobby.connected") : t("lobby.connecting")}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder={t("lobby.roomNamePlaceholder")}
              disabled={joined}
              className="flex-1 rounded-xl bg-slate-800 px-4 py-3 outline-none"
            />

            {connected && !joined && (
              <button
                onClick={joinRoom}
                className="rounded-xl bg-blue-600 px-6 py-3 font-black hover:bg-blue-500"
              >
                {t("lobby.join")}
              </button>
            )}
          </div>

          {joined && (
            <div className="rounded-2xl p-3">
              <div className="mb-3 flex h-12 w-full gap-x-1">
                <DropdownMenu
                  className="h-full w-1/2"
                  color="bg-byellow"
                  items={friends.map((friend) => ({
                    label: friend.username,
                    onClick: () => {
                      console.log("friend id =", friend.id);
                      invite(friend.id, roomId);
                    },
                  }))}
                >
                  {t("lobby.invite")}
                </DropdownMenu>

                <button
                  onClick={leaveRoom}
                  className="w-1/2 rounded-2xl bg-bred p-2 shadow-md shadow-black/75 hover:z-50 hover:outline-3"
                >
                  {t("lobby.leave")}
                </button>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    {t("lobby.players")}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {t("lobby.readyCount", {
                      ready: players.filter((player) => player.ready).length,
                      total: players.length,
                    })}
                  </p>
                </div>

                <button
                  onClick={toggleReady}
                  className={`rounded-xl px-6 py-3 font-black shadow-md shadow-black/75 hover:z-50 hover:outline-3 ${
                    ready ? "bg-bgreen" : "bg-bblue"
                  }`}
                >
                  {ready ? t("lobby.readyToggleOn") : t("lobby.readyToggleOff")}
                </button>
              </div>

              <div className="space-y-3">
                {players.length === 0 && (
                  <div className="rounded-xl bg-slate-800 p-6 text-center text-slate-500">
                    {t("lobby.noPlayers")}
                  </div>
                )}

                {players.map((player, index) => (
                  <div
                    key={player.playerId}
                    className={`flex items-center gap-3 rounded-xl ${
                      colors[index % colors.length]
                    } p-3 shadow-md`}
                  >
                    <PlayerAvatar
                      playerId={player.playerId}
                      username={player.username}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-black">
                        {player.username}

                        {player.playerId === playerId && (
                          <span className="ml-1 text-bblue">
                            {t("lobby.you")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`shrink-0 font-black ${
                        player.ready
                          ? "text-bgreen"
                          : "text-white/50"
                      }`}
                    >
                      {player.ready ? t("lobby.statusReady") : t("lobby.statusWaiting")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}