import { useState } from "react";

import { Roulette } from "./gambling/roulette";
import { PhaseTimer } from "./gambling/phaseTimer";
import { Balance } from "./gambling/balance";
import { BettingPanel } from "./gambling/bettingPanel";
import { MyResult } from "./gambling/Result";
import { ResultsTable } from "./gambling/resultTable";
import { ScratchTicket } from "./gambling/scratchTicket";

export default function Gambling() {
  const [betAmount, setBetAmount] =
    useState(50);

  const [target, setTarget] =
    useState("red");

  const [hasBet, setHasBet] =
    useState(false);

  const [balance, setBalance] =
    useState(1000);

  const [currentBet, setCurrentBet] =
    useState<{
      chipValue: number;
      target: string;
    } | null>(null);

  const [ticket, setTicket] =
    useState<any>(null);

  const placeBet = () => {
    setHasBet(true);

    setCurrentBet({
      chipValue: betAmount,
      target,
    });
  };

  const scratch = () => {
    setTicket({
      type: "bonus",
      value: 0.2,
    });
  };

  return (
    <>
      <main className="relative">
		<div className="flex inset-0 mx-auto">
        <Balance
          balance={balance}
        />
		</div>

        <PhaseTimer
          state="betting"
          countdown={15}
        />

        <Roulette
          winningNumber={17}
          state="betting"
        />

        <BettingPanel
          state="betting"
          balance={balance}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          target={target}
          setTarget={setTarget}
          currentBet={currentBet}
          hasBet={hasBet}
          phaseCountdown={15}
          placeBet={placeBet}
        />

        <ScratchTicket
          state="scratch"
          hasBet={hasBet}
          ticket={ticket}
          countdown={10}
          scratch={scratch}
        />

        <MyResult
          result={null}
        />

        <ResultsTable
          results={[]}
          playerId="demo"
        />

      </main>
    </>
  );
}