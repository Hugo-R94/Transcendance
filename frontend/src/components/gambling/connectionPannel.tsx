type ConnectionPanelProps = {
  connected: boolean;
  joined: boolean;

  roomId: string;

  onRoomIdChange: (value: string) => void;

  onConnect: () => void;
  onDisconnect: () => void;
  onJoin: () => void;
};

export default function ConnectionPanel({
  connected,
  joined,
  roomId,
  onRoomIdChange,
  onConnect,
  onDisconnect,
  onJoin,
}: ConnectionPanelProps) {
  return (
    <div className="connection-panel">

      <input
        value={roomId}
        onChange={(e) =>
          onRoomIdChange(e.target.value)
        }
        placeholder="Room ID"
      />

      {!connected ? (
        <button
          type="button"
          onClick={onConnect}
        >
          CONNECTER
        </button>
      ) : (
        <button
          type="button"
		  className="bg-bblue w-fit h-10"
          onClick={onDisconnect}
        >
          DÉCONNECTER
        </button>
      )}

      <button
        type="button"
        onClick={onJoin}
        disabled={!connected || joined}
      >
        REJOINDRE
      </button>

    </div>
  );
}