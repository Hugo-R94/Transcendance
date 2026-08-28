import { useState } from "react";
import { ResultsTable } from "../components/gambling/resultTable";
import type { Player } from "../api/gambling";
import type { Result } from "../api/gambling";

const testPlayers: Player[] = [
  {
    playerId: "player-1",
    username: "Alice",
    playerNumber: 0,
  },
  {
    playerId: "player-2",
    username: "Bob",
    playerNumber: 1,
  },
  {
    playerId: "player-3",
    username: "Charlie",
    playerNumber: 2,
  },
  {
    playerId: "player-4",
    username: "David",
    playerNumber: 3,
  },
  {
    playerId: "player-5",
    username: "Eve",
    playerNumber: 4,
  },
];

const testResults: Result[] = [
  {
    playerId: "player-1",
    username: "Alice",
    result: "RED",
    balanceBefore: 1000,
    gain: 200,
    balanceAfter: 200,
  },
  {
    playerId: "player-2",
    username: "Bob",
    playerNumber: 1,
    result: "BLACK",
    balanceBefore: 1500,
    gain: -100,
    balanceAfter: 8000,
  },
  {
    playerId: "player-3",
    username: "Charlie",
    playerNumber: 2,
    result: "17",
    balanceBefore: 800,
    gain: 300,
    balanceAfter: 1255,
  },
  {
    playerId: "player-4",
    username: "David",
    playerNumber: 3,
    result: "ODD",
    balanceBefore: 2000,
    gain: -250,
    balanceAfter: 1150,
  },
  {
    playerId: "player-5",
    username: "Eve",
    playerNumber: 4,
    result: "0",
    balanceBefore: 500,
    gain: 500,
    balanceAfter: 6000,
  },
];

export default function ResultsTableTest() {
  const [scoreCount, setScoreCount] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const displayedResults = testResults.slice(0, scoreCount);

  const replayResults = () => {
    setShowResults(false);

    // Permet de forcer React à démonter ResultsTable
    // avant de le recréer et donc de rejouer toute l'animation.
    setTimeout(() => {
      setAnimationKey((key) => key + 1);
      setShowResults(true);
    }, 50);
  };

  const changeScoreCount = (count: number) => {
    setScoreCount(count);

    setShowResults(false);

    setTimeout(() => {
      setAnimationKey((key) => key + 1);
      setShowResults(true);
    }, 50);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-900 p-8">
      {/* CONTROLES */}
      <div className="fixed left-5 top-5 z-[10000] flex flex-col gap-3 rounded-2xl bg-black/80 p-4 text-white shadow-2xl">
        <div className="font-black">
          TEST RESULTS TABLE
        </div>

        {/* NOMBRE DE SCORES */}
        <label className="flex items-center gap-3 text-sm">
          <span>Nombre de scores :</span>

          <select
            value={scoreCount}
            onChange={(event) => {
              changeScoreCount(Number(event.target.value));
            }}
            className="rounded-lg bg-white px-3 py-2 font-bold text-black outline-none"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>

        {/* REJOUER */}
        <button
          type="button"
          onClick={replayResults}
          className="
            rounded-xl
            bg-bblue
            px-4
            py-2
            font-black
            text-white
            transition
            hover:brightness-110
            active:scale-95
          "
        >
          🔄 Rejouer l'animation
        </button>

        {/* AFFICHER */}
        <button
          type="button"
          onClick={() => {
            setAnimationKey((key) => key + 1);
            setShowResults(true);
          }}
          className="
            rounded-xl
            bg-bgreen
            px-4
            py-2
            font-black
            text-white
            transition
            hover:brightness-110
            active:scale-95
          "
        >
          Afficher les résultats
        </button>

        {/* CACHER */}
        <button
          type="button"
          onClick={() => setShowResults(false)}
          className="
            rounded-xl
            bg-bred
            px-4
            py-2
            font-black
            text-white
            transition
            hover:brightness-110
            active:scale-95
          "
        >
          Cacher
        </button>

        {/* INFOS */}
        <div className="text-xs text-white/50">
          {displayedResults.length} résultat
          {displayedResults.length > 1 ? "s" : ""} affiché
          {displayedResults.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* RESULTS TABLE */}
      {showResults && (
        <ResultsTable
          key={animationKey}
          results={displayedResults}
          playerId="player-1"
          players={testPlayers}
        />
      )}
    </main>
  );
}
