import { useEffect, useRef } from "react";
import BettingTable from "./bettingTable";
import { Balance } from "./balance";

type ButtonChipProps = {
  amount: number;
  betAmount: number;
  color: string;
  setBetAmount: (value: number) => void;
  disabled?: boolean;
};

function ButtonChip({ amount, betAmount, color, setBetAmount, disabled }: ButtonChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setBetAmount(betAmount + amount)}
      className={`${color} h-8 w-9 sm:h-10 sm:w-15 card balatro rounded-lg sm:rounded-xl translate-y-1 active:scale-90 hover:z-100 text-xs sm:text-base font-bold`}
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
  setBetAmount: (value: number) => void;
  target: string;
  setTarget: (value: string) => void;
  currentBet: { chipValue: number; target: string } | null;
  hasBet: boolean;
  phaseCountdown: number | null;
  placeBet: (target: string, amount: number) => void;
  userID: string;
  playerNumber: number;
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
  userID,
  playerNumber,
}: BettingPanelProps) {

  const bettingDisabled = state !== "betting" || phaseCountdown === 0;
  const alreadyBetAmount = currentBet?.chipValue || 0;
  const effectiveBalance = balance + alreadyBetAmount;
  const tableDisabled = bettingDisabled || betAmount <= 0 || betAmount > effectiveBalance;

  // S'assurer que le pari commence à 100 si aucune mise n'est encore active et que betAmount n'est pas défini
  useEffect(() => {
    if (!currentBet && betAmount <= 0) {
      setBetAmount(100);
    }
  }, [currentBet]);

  const isInitialMount = useRef(true);

  // Envoi automatique du JSON dès que la cible ou le montant change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (bettingDisabled || !target || betAmount <= 0 || betAmount > effectiveBalance) {
      return;
    }

    if (currentBet?.target === target && currentBet?.chipValue === betAmount) {
      return;
    }

    placeBet(target, betAmount);
  }, [target, betAmount]);

  const handleTargetChange = (newTarget: string) => {
    if (bettingDisabled || betAmount <= 0 || betAmount > effectiveBalance) return;
    setTarget(newTarget);
    placeBet(newTarget, betAmount);
  };

  return (
    <div className="flex flex-col items-center justify-center">

      {/* TABLE DE ROULETTE */}
      <div className="my-3 aspect-[3/2] w-[95%] sm:w-125">
        <BettingTable
          target={target}
          setTarget={handleTargetChange}
          disabled={tableDisabled}
          chipValue={betAmount}
          userID={userID}
          playerNumber={playerNumber}
        />
      </div>

      {/* BALANCE */}
      <div className="my-2 mb-5 flex flex-col items-center justify-center gap-1">
        <div className="flex h-10 w-[90%] justify-center sm:w-100">
          <Balance balance={balance}/>
        </div>
        {alreadyBetAmount > 0 && (
          <span className="text-xs text-white/60">
            Balance après modification : {effectiveBalance - betAmount}
          </span>
        )}
      </div>

      {/* TITRE */}
      <div className="hidden card bg-bblue w-fit p-2 text-3xl font-extrabold sm:block">
        <p>How much do you want to bet ???</p>
      </div>

      {/* MONTANT ET BOUTONS DE JETONS */}
      <div className="my-1 h-fit w-full px-2 sm:my-3 sm:w-fit sm:px-0">
        <div className="flex w-full justify-center gap-2 font-bold sm:gap-3">
          <ButtonChip amount={-100} color="bg-bblue" betAmount={betAmount} setBetAmount={setBetAmount} disabled={bettingDisabled} />
          <ButtonChip amount={-50} color="bg-bred" betAmount={betAmount} setBetAmount={setBetAmount} disabled={bettingDisabled} />
          <ButtonChip amount={-25} color="bg-byellow" betAmount={betAmount} setBetAmount={setBetAmount} disabled={bettingDisabled} />

          <input
            className="card h-8 w-14 rounded-lg bg-bgreen p-1 text-center text-sm font-bold outline-none sm:h-10 sm:w-20 sm:rounded-2xl sm:p-3 sm:text-base"
            type="number"
            min={1}
            value={betAmount}
            disabled={bettingDisabled}
            onChange={(event) => setBetAmount(Number(event.target.value))}
          />

          <ButtonChip amount={25} color="bg-byellow" betAmount={betAmount} setBetAmount={setBetAmount} disabled={bettingDisabled} />
          <ButtonChip amount={50} color="bg-bred" betAmount={betAmount} setBetAmount={setBetAmount} disabled={bettingDisabled} />
          <ButtonChip amount={100} color="bg-bblue" betAmount={betAmount} setBetAmount={setBetAmount} disabled={bettingDisabled} />
        </div>
      </div>

      {/* MISE ACTUELLE */}
      <div className="flex items-center justify-center gap-x-1 text-center text-sm sm:text-base">
        <p>Mise actuelle</p>
        <p className="mx-2 text-xl font-extrabold sm:mx-3">{betAmount}</p>
        <span>sur</span>
        <p className="mx-2 text-xl font-extrabold sm:mx-3">{target || "-"}</p>
      </div>

      {/* INFO */}
      <p className="mt-2 text-xs text-white/50">
        Clique sur une case pour placer ta mise
      </p>

    </div>
  );
}