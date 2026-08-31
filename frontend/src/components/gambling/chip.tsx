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

	// calcul nombre de coin
	const coinCount = Math.max(1, Math.floor(value / 100),);

	// decalage en x des joueur  
  const stackShiftX =
    stackIndex * 16;

	// decalage en y des joueur  
  const stackShiftY =
    stackIndex * -12;

	// offset randomiser de la pile
  const randomPosition = useMemo(
    () => ({
      x: Math.floor(Math.random() * 9) - 4,
      y: Math.floor(Math.random() * 7) - 3,
    }),
    [],
  );

//   Decalage des coins les uns par rapport aux autre
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
