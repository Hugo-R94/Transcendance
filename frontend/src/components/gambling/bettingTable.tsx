import Chip from "./chip";

type BettingTableProps = {
  target: string;
  setTarget: (value: string) => void;
  disabled: boolean;
  chipValue: number;
  userID: string;
  playerNumber: number;
};

const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const rouletteGrid = [
  [32, 15, 19, 4, 21],
  [2, 25, 17, 34, 6],
  [27, 13, 0, 36, 11],
  [30, 8, 23, 10, 5],
  [24, 16, 33, 1, 20],
];

const specialBets = [
  { id: "red", label: "RED", color: "bg-bred" },
  { id: "even", label: "EVEN", color: "bg-bgreen" },
  { id: "odd", label: "ODD", color: "bg-bred" },
  { id: "green", label: "GREEN", color: "bg-bgreen" },
];

const chipColors = [
  "bg-bblue",
  "bg-byellow",
  "bg-bgreen",
  "bg-bred",
];

function BettingTable({
  target,
  setTarget,
  userID,
  playerNumber,
  disabled,
  chipValue,
}: BettingTableProps) {
  const getNumberColor = (number: number) => {
    if (number === 0) return "bg-black";
    return redNumbers.has(number) ? "bg-bred" : "bg-bgreen";
  };

  const getChipColor = (targetValue: string) => {
    if (targetValue === "red") return "bg-bred";
    if (targetValue === "green") return "bg-bgreen";

    const number = Number(targetValue);

    if (!Number.isNaN(number)) {
      return chipColors[number % chipColors.length];
    }

    if (targetValue === "even") return "bg-bblue";
    if (targetValue === "odd") return "bg-byellow";

    return "bg-bred";
  };

  const chipColor = getChipColor(target);

  return (
    <div className="relative h-full w-full">
      {/* GRILLE */}
      <div className="relative grid h-[85%] w-full grid-cols-5 grid-rows-5 gap-0.5">
        {rouletteGrid.flat().map((number) => {
          const value = number.toString();
          const isSelected = target === value;

          return (
            <div key={number} className="relative min-h-0 min-w-0">
              <button
                type="button"
                disabled={disabled}
                onClick={() => setTarget(value)}
                className={`
                  relative flex h-full w-full items-center justify-center
                  rounded-lg font-black text-white transition
                  ${getNumberColor(number)}
                  hover:brightness-125 hover:card balatro
                  hover:z-100 hover:outline-2 active:scale-90
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
              >
                {number}
              </button>

              {isSelected && (
				<Chip
				value={chipValue}
				userID={userID}
				playerNumber={playerNumber}
				/>
              )}
            </div>
          );
        })}
      </div>

      {/* PARIS SPÉCIAUX */}
      <div className="relative mt-1 flex h-[15%] w-full gap-x-3">
        {specialBets.map((bet) => {
          const isSelected = target === bet.id;

          return (
            <div
              key={bet.id}
              className={`relative w-full ${isSelected ? "z-[100]" : "z-0"}`}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => setTarget(bet.id)}
                className={`
                  relative flex h-full w-full items-center justify-center
                  rounded-b-2xl ${bet.color} font-black
                  hover:card balatro hover:outline-2 active:scale-90
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
              >
                {bet.label}
              </button>

              {isSelected && (
				<Chip
				value={chipValue}
				userID={userID}
				playerNumber={playerNumber}
				/>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BettingTable;