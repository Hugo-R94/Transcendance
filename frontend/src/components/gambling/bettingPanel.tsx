import { useEffect, useRef } from "react";
import BettingTable from "./bettingTable";
import { Balance } from "./balance";
import type { PlayerBet } from "../../api/gambling";

type ButtonChipProps = {
  amount: number;
  betAmount: number;
  color: string;
  setBetAmount: (value: number) => void;
  disabled?: boolean;
};

function ButtonChip({
  amount,
  betAmount,
  color,
  setBetAmount,
  disabled,
}: ButtonChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setBetAmount(betAmount + amount)}
      className={`${color} h-7 w-8 sm:h-8 sm:w-14 card balatro rounded-lg sm:rounded-xl
        active:scale-90 hover:z-100 text-xs sm:text-base font-bold shrink-0`}>
      {amount > 0 ? "+" : ""}
      {amount}
    </button>
  );
}

type BettingPanelProps = {
  state: string;
  balance: number;
  betAmount: number;
  setBetAmount: (value: number) => void;
  target: string;
  setTarget: (value: string) => void;
  currentBet: { chipValue: number; target: string } | null;
  hasBet: boolean;
  phaseCountdown: number | null;
  placeBet: (target: string, amount: number) => void;
  userID: string;
  playerNumber: number;
  playerBets: PlayerBet[];
};

export function BettingPanel({
  state,
  balance,
  betAmount,
  setBetAmount,
  target,
  setTarget,
  currentBet,
  phaseCountdown,
  placeBet,
  playerBets,
}: BettingPanelProps) {
  const bettingDisabled =
    state !== "betting" || phaseCountdown === 0;

  const alreadyBetAmount = currentBet?.chipValue || 0;

  const effectiveBalance = balance + alreadyBetAmount;

  const tableDisabled =
    bettingDisabled ||
    betAmount <= 0 ||
    betAmount > effectiveBalance;

  useEffect(() => {
    if (!currentBet && betAmount <= 0) {
      setBetAmount(100);
    }

    if (!target) {
      setTarget("red");
    }
  }, [currentBet]);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (
      bettingDisabled ||
      !target ||
      betAmount <= 0 ||
      betAmount > effectiveBalance
    ) {
      return;
    }

    if (
      currentBet?.target === target &&
      currentBet?.chipValue === betAmount
    ) {
      return;
    }

    placeBet(target, betAmount);
  }, [target, betAmount]);

  const handleTargetChange = (newTarget: string) => {
    if (
      bettingDisabled ||
      betAmount <= 0 ||
      betAmount > effectiveBalance
    ) {
      return;
    }

    setTarget(newTarget);
    placeBet(newTarget, betAmount);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center">
      {/* TABLE DE ROULETTE */}
      <div className="flex min-h-0 flex-1 w-full items-center justify-center">
        <div className="h-full max-h-full max-w-full aspect-[3/2] shrink-0 rounded-4xl">
          <BettingTable
            target={target}
            setTarget={handleTargetChange}
            disabled={tableDisabled}
            bets={playerBets}
          />
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col items-center">
        {/* BALANCE */}
        <div className="my-1.5 flex flex-col items-center justify-center gap-0.5">
          <div className="flex h-7 w-full justify-center sm:h-8 sm:w-80">
            <Balance balance={balance} />
          </div>
        </div>

        <div className="hidden w-[90%] card bg-bblue p-1 text-lg font-extrabold sm:block mb-2">
          <p>How much do you want to bet ???</p>
        </div>

        <div className="my-0.5 w-full px-2 sm:w-fit sm:px-0">
          <div className="flex w-full justify-center gap-1.5 sm:gap-2">
            <ButtonChip
              amount={-100}
              color="bg-bblue"
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              disabled={bettingDisabled}
            />

            <ButtonChip
              amount={-50} color="bg-bred" betAmount={betAmount}
              setBetAmount={setBetAmount} disabled={bettingDisabled}/>

            <ButtonChip
              amount={-25} color="bg-byellow" betAmount={betAmount}
              setBetAmount={setBetAmount} disabled={bettingDisabled}/>

            <input
              className="card h-7 w-12 shrink-0 rounded-lg bg-bgreen p-1 text-center text-xs
                font-bold outline-none sm:h-8 sm:w-20 sm:rounded-2xl sm:p-1 sm:text-base"
              type="number"
              min={1} value={betAmount}
              disabled={bettingDisabled}
              onChange={(event) =>
                setBetAmount(Number(event.target.value))
              }
            />

            <ButtonChip
              amount={25} color="bg-byellow" betAmount={betAmount}
              setBetAmount={setBetAmount} disabled={bettingDisabled}/>

            <ButtonChip
              amount={50} color="bg-bred" betAmount={betAmount}
              setBetAmount={setBetAmount} disabled={bettingDisabled}/>

            <ButtonChip
              amount={100} color="bg-bblue" betAmount={betAmount}
              setBetAmount={setBetAmount} disabled={bettingDisabled}/>
			  
          </div>
        </div>

        <div className="flex items-center justify-center gap-x-1 text-xs text-center sm:text-sm">
          <p>Mise actuelle</p>

          <p className="mx-1 text-base font-extrabold sm:mx-2 sm:text-lg">
            {betAmount}
          </p>

          <span>sur</span>

          <p className="mx-1 text-base font-extrabold sm:mx-2 sm:text-lg">
            {target || "-"}
          </p>
        </div>

        <p className="mt-0.5 text-[10px] text-white/50 sm:text-xs">
          Clique sur une case pour placer ta mise
        </p>
      </div>
    </div>
  );
}
