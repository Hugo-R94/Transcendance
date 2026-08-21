import type { Player } from "../../types/game";

type LobbyPlayersProps = {
  players: Player[];

  playerId: string;

  ready: boolean;
  joined: boolean;

  onToggleReady: () => void;
};

export default function LobbyPlayers({
  players,
  playerId,

  ready,
  joined,

  onToggleReady,
}: LobbyPlayersProps) {
  const readyPlayers =
    players.filter(
      (player) =>
        player.ready
    ).length;

  return (
    <section className="lobby-players">

      <div className="lobby-players-header">

        <div>
          <h2>
            Joueurs
          </h2>

          <p>
            {readyPlayers} /{" "}
            {players.length} prêts
          </p>
        </div>

        {joined && (
          <button
            onClick={
              onToggleReady
            }
            className={
              ready
                ? "ready-button active"
                : "ready-button"
            }
          >
            {ready
              ? "✓ READY"
              : "SE METTRE READY"}
          </button>
        )}

      </div>

      {players.length === 0 ? (
        <div className="lobby-empty">
          Aucun joueur dans la room.
        </div>
      ) : (
        <div className="lobby-player-list">

          {players.map(
            (player) => {
              const isMe =
                player.playerId ===
                playerId;

              return (
                <div
                  key={
                    player.playerId
                  }
                  className="lobby-player"
                >

                  <div>
                    <strong>
                      {
                        player.username
                      }

                      {isMe && (
                        <span>
                          {" "}
                          (toi)
                        </span>
                      )}
                    </strong>

                    <small>
                      {
                        player.playerId
                      }
                    </small>
                  </div>

                  <div>
                    <span>
                      {player.ready
                        ? "✓ READY"
                        : "WAITING"}
                    </span>

                    <span>
                      {
                        player.balance
                      }{" "}
                      crédits
                    </span>
                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </section>
  );
}