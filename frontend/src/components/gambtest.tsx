import { useState } from "react";

import { Roulette } from "./gambling/roulette";
import { PhaseTimer } from "./gambling/phaseTimer";
import { BettingPanel } from "./gambling/bettingPanel";
import { MyResult } from "./gambling/Result";
import { ResultsTable } from "./gambling/resultTable";

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

  const placeBet = (
    newTarget: string,
    amount: number
  ) => {
    setHasBet(true);

    setCurrentBet({
      chipValue: amount,
      target: newTarget,
    });

    setTarget(newTarget);
    setBetAmount(amount);
  };

  return (
    <>
      <main className="relative">

        {/* TIMER */}
        <div className="mt-5">
          <PhaseTimer
            state="betting"
            countdown={15}
          />
        </div>

        {/* ROULETTE */}
        <div className="mt-20">
          <Roulette
            winningNumber={0}
            state="betting"
          />
        </div>

        {/* TABLE */}
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

          /*
           * TEST
           *
           * Ici on simule le joueur connecté.
           */
          userID="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODczMzU2NzMsImlkIjoiNTFmODIwMjQtOWZlZS00OTFiLWE1MGItYmZhZjc5ZDU1NWVlIn0.jmpObXXWjk5EDe1s9L68g1IeXQfghG5pMQfdSL5RIrM"

          /*
           * TEST
           *
           * Le joueur numéro 2
           * doit donc avoir la couleur
           * correspondant au numéro 2.
           */
          playerNumber={2}
        />

        {/* RESULTAT */}
        <MyResult
          result={null}
        />

        {/* HISTORIQUE */}
        <ResultsTable
          results={[]}
          playerId="demo"
        />

      </main>
    </>
  );
}