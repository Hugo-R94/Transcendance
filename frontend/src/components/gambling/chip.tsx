import { useMemo } from "react";
import Coin from "./coin";

type ChipProps = {
  value: number;
  userID: string;
  playerNumber: number;
  stackIndex?: number;
};

function Chip({
  value,
  userID,
  playerNumber,
  stackIndex = 0,
}: ChipProps) {
  /*
   * 1 coin = 100
   *
   * 100  -> 1
   * 200  -> 2
   * 300  -> 3
   * 500  -> 5
   */
  const coinCount = Math.max(
    1,
    Math.floor(value / 100),
  );

  /*
   * Décalage de la pile lorsqu'il y a plusieurs
   * joueurs sur la même case.
   */
  const stackShiftX =
    stackIndex * 16;

  const stackShiftY =
    stackIndex * -12;

  /*
   * Petit décalage aléatoire propre à chaque pile.
   */
  const randomPosition = useMemo(
    () => ({
      x: Math.floor(Math.random() * 9) - 4,
      y: Math.floor(Math.random() * 7) - 3,
    }),
    [],
  );

  /*
   * Chaque coin est légèrement décalé
   * horizontalement et verticalement.
   *
   * Cela donne une vraie impression de pile
   * plutôt qu'une colonne parfaitement droite.
   */
  const coinOffsets = useMemo(() => {
    return Array.from(
      { length: coinCount },
      (_, index) => ({
        x:
          Math.floor(Math.random() * 5) - 2,
        y:
          Math.floor(Math.random() * 3) - 1 -
          index * 3,
      }),
    );
  }, [coinCount]);

  return (
    <div
      className="pointer-events-none absolute -right-3 -top-5"
      style={{
        width: 64,
        height:
          40 + coinCount * 3,

        transform: `translate(
          ${randomPosition.x + stackShiftX}px,
          ${randomPosition.y + stackShiftY}px
        )`,

        zIndex:
          40 +
          stackIndex +
          coinCount,
      }}
    >
      {coinOffsets.map(
        (offset, index) => {
          const isTop =
            index === coinCount - 1;

          return (
            <div
              key={index}
              className="absolute"
              style={{
                left:
                  12 + offset.x,
                top:
                  (coinCount - 1 - index) *
                    3 +
                  offset.y,

                zIndex:
                  index,
              }}
            >
              <Coin
                userID={userID}
                playerNumber={
                  playerNumber
                }
                value={
                  isTop
                    ? value
                    : 100
                }
              />
            </div>
          );
        },
      )}
    </div>
  );
}

export default Chip;
