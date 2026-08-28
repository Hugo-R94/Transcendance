import Chip from "./chip";

export type Bet = {
  playerId: string;
  playerNumber: number;
  target: string;
  chipValue: number;
};

type BettingTableProps = {
  target: string;
  setTarget: (value: string) => void;
  disabled: boolean;
  bets: Bet[];
};

const redNumbers = new Set([
  1, 2, 3, 5, 6, 8, 9, 10, 11, 18, 20, 21,
]);

const rouletteGrid = [
  [7, 18, 4, 21, 12],
  [2, 19, 9, 16, 6],
  [24, 11, 0, 3, 14],
  [8, 17, 5, 22, 20],
  [13, 1, 23, 10, 15],
];

const specialBets = [
  { id: "red", label: "RED", color: "bg-bred" },
  { id: "even", label: "EVEN", color: "bg-bblue" },
  { id: "odd", label: "ODD", color: "bg-bblue" },
  { id: "green", label: "GREEN", color: "bg-bgreen" },
];

function BettingTable({
  target,
  setTarget,
  disabled,
  bets,
}: BettingTableProps) {
  const getNumberColor = (number: number) => {
    if (number === 0) return "bg-black";

    return redNumbers.has(number) ? "bg-bred" : "bg-bgreen";
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* GRILLE */}
      <div className="relative min-h-0 flex-1 grid w-full grid-cols-5 grid-rows-5 gap-0.5">
        {rouletteGrid.flat().map((number) => {
          const value = number.toString();
          const isSelected = target === value;

          const cellBets = bets.filter(
            (bet) => bet.target === value,
          );

          return (
            <div
              key={number}
              className="relative min-h-0 min-w-0"
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => setTarget(value)}
                className={`
                  relative flex h-full w-full items-center justify-center
                  rounded-lg font-black text-white transition
                  ${getNumberColor(number)}
                  hover:brightness-125 hover:card balatro
                  hover:z-[100] hover:outline-2
                  active:scale-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  shadow-sm shadow-black/50
                  ${isSelected ? "outline-2 outline-white" : ""}
                `}
              >
                {number}
              </button>

              {cellBets.map((bet, index) => (
                <Chip
                  key={`${bet.playerId}-${bet.target}-${index}`}
                  value={bet.chipValue}
                  userID={bet.playerId}
                  playerNumber={bet.playerNumber}
                  stackIndex={index}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* PARIS SPÉCIAUX */}
      <div className="relative mt-1 flex h-[15%] min-h-0 w-full shrink-0 gap-x-3">
        {specialBets.map((bet) => {
          const isSelected = target === bet.id;

          const cellBets = bets.filter(
            (b) => b.target === bet.id,
          );

          return (
            <div
              key={bet.id}
              className={`
                relative w-full
                ${isSelected ? "z-[100]" : "z-0"}
              `}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => setTarget(bet.id)}
                className={`
                  relative flex h-full w-full items-center justify-center
                  rounded-b-2xl ${bet.color}
                  font-black
                  hover:card balatro
                  hover:outline-2
                  active:scale-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  shadow-sm shadow-black/50
                  ${isSelected ? "outline-2 outline-white" : ""}
                `}
              >
                {bet.label}
              </button>

              {cellBets.map((b, index) => (
                <Chip
                  key={`${b.playerId}-${b.target}-${index}`}
                  value={b.chipValue}
                  userID={b.playerId}
                  playerNumber={b.playerNumber}
                  stackIndex={index}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BettingTable;
