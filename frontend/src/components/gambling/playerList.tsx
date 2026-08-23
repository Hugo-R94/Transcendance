import type { Player } from "../../types/gambling";

type PlayersListProps = {
  players: Player[];
  playerId: string;
  ready: boolean;
  joined: boolean;
  toggleReady: () => void;
};

export function PlayersList({
  players,
  playerId,
  ready,
  joined,
  toggleReady,
}: PlayersListProps) {
  const readyCount =
    players.filter(
      (player) => player.ready
    ).length;

  return (
    <section>

      <header>
        <div>
          <h2>
            Joueurs
          </h2>

          <p>
            {readyCount} /{" "}
            {players.length} prêts
          </p>
        </div>

        {joined && (
          <button
            onClick={toggleReady}
          >
            {ready
              ? "✓ READY"
              : "SE METTRE READY"}
          </button>
        )}
      </header>

      {players.map(
        (player) => (
          <article
            key={player.playerId}
          >
            <div>
              <strong>
                {player.username}

                {player.playerId ===
                  playerId && (
                  <span>
                    {" "}
                    (toi)
                  </span>
                )}
              </strong>

              <small>
                {player.playerId}
              </small>
            </div>

            <div>
              <strong>
                {player.ready
                  ? "✓ READY"
                  : "WAITING"}
              </strong>

              <span>
                {player.balance} crédits
              </span>
            </div>
          </article>
        )
      )}

    </section>
  );
}