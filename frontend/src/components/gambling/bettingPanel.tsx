import BettingTable from "./bettingTable";

type ButtonChipProps = {
  amount: number;
  betAmount: number;
  color: string;
  setBetAmount: (
    value: number
  ) => void;
  disabled?: boolean;
};

function ButtonChip({
  amount,
  betAmount,
  color,
  setBetAmount,
  disabled = false,
}: ButtonChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        setBetAmount(
          betAmount + amount
        )
      }
      className={`${color} w-15 h-10 card balatro active:scale-90 translate-y-1 hover:z-100`}
    >
      {amount > 0 ? "+" : ""}
      {amount}
    </button>
  );
}

type BettingPanelProps = {
  state: string;
  balance: number;

  betAmount: number;
  setBetAmount: (
    value: number
  ) => void;

  target: string;
  setTarget: (
    value: string
  ) => void;

  currentBet: {
    chipValue: number;
    target: string;
  } | null;

  hasBet: boolean;

  phaseCountdown:
    | number
    | null;

  placeBet: () => void;
};

export function BettingPanel({
  state,
  balance,
  betAmount,
  setBetAmount,
  target,
  setTarget,
  currentBet,
  hasBet,
  phaseCountdown,
  placeBet,
}: BettingPanelProps) {
  const disabled =
    state !== "betting" ||
    hasBet ||
    phaseCountdown === 0;

  return (
    <div className="flex flex-col justify-center items-center">

      <h2>
        Ton pari
      </h2>
		<div className="w-100 h-100">
			<BettingTable/>
		</div>
      <div className="bg-bblue w-fit h-fit p-2 card text-3xl font-extrabold">
        <p>
          How much do you want to bet ???
        </p>
      </div>

      <div className="w-fit h-fit my-3">

        <div className="flex gap-2 font-bold">

          <ButtonChip
            amount={-100}
			color="bg-bblue"
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            disabled={disabled}
          />

          <ButtonChip
		  	color="bg-bred"
            amount={-50}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            disabled={disabled}
          />
		  
      		<ButtonChip
		  	color="bg-byellow"
            amount={-25}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            disabled={disabled}
          />
		  
		  
          <input
            className="bg-bgreen rounded-2xl w-fit h-fit p-3 card"
            type="number"
            min={1}
            value={betAmount}
            disabled={disabled}
            onChange={(event) =>
              setBetAmount(
                Number(
                  event.target.value
                )
              )
            }
          />
		  
		  
      		<ButtonChip
		  	color="bg-byellow"
            amount={+25}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            disabled={disabled}
          />
          <ButtonChip
		  	color="bg-bred"
            amount={+50}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            disabled={disabled}
          />

          <ButtonChip
            amount={+100}
			color="bg-bblue"
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            disabled={disabled}
          />

        </div>

      </div>

      <div>
        <button
          disabled={disabled}
          onClick={() =>
            setTarget("red")
          }
        >
          🔴 Rouge
        </button>

        <button
          disabled={disabled}
          onClick={() =>
            setTarget("green")
          }
        >
          ⚫ Noir
        </button>

        <button
          disabled={disabled}
          onClick={() =>
            setTarget("odd")
          }
        >
          Impair
        </button>

        <button
          disabled={disabled}
          onClick={() =>
            setTarget("even")
          }
        >
          Pair
        </button>
      </div>

      <div>
        <p>
          Mise actuelle
        </p>

        <strong>
          {currentBet
            ? currentBet.chipValue
            : betAmount}
        </strong>

        <span>
          sur {currentBet?.target ?? target}
        </span>
      </div>

      <button
        onClick={placeBet}
        disabled={
          disabled ||
          betAmount <= 0 ||
          betAmount > balance
        }
      >
        {hasBet
          ? "✓ MISE PLACÉE"
          : `MISER ${betAmount}`}
      </button>

    </div>
  );
}