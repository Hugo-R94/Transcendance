import { useEffect, useMemo, useState } from "react";
import type { Player } from "../../api/gambling";
import type { Result } from "../../types/gambling";

type ResultsTableProps = {
  results: Result[];
  playerId: string;
  players: Player[];
};

const chipColors = [
  {
    bg: "bg-bblue",
    border: "border-blue-950",
    shadow:
      "shadow-[0_4px_0_#172554,0_6px_8px_rgba(0,0,0,0.5)]",
  },
  {
    bg: "bg-bred",
    border: "border-red-950",
    shadow:
      "shadow-[0_4px_0_#450a0a,0_6px_8px_rgba(0,0,0,0.5)]",
  },
  {
    bg: "bg-byellow",
    border: "border-yellow-950",
    shadow:
      "shadow-[0_4px_0_#451a03,0_6px_8px_rgba(0,0,0,0.5)]",
  },
  {
    bg: "bg-bgreen",
    border: "border-green-950",
    shadow:
      "shadow-[0_4px_0_#052e16,0_6px_8px_rgba(0,0,0,0.5)]",
  },
];

export function ResultsTable({
  results,
  playerId,
  players,
}: ResultsTableProps) {
  const [sortedByAfter, setSortedByAfter] = useState(false);

  /*
   * On commence avec le classement AVANT.
   */
  const beforeResults = useMemo(
    () =>
      [...results].sort(
        (a, b) => b.balanceBefore - a.balanceBefore
      ),
    [results]
  );

  /*
   * Puis on passe au classement APRÈS.
   */
  const afterResults = useMemo(
    () =>
      [...results].sort(
        (a, b) => b.balanceAfter - a.balanceAfter
      ),
    [results]
  );

  /*
   * Après 2 secondes, on déclenche le second tri.
   */
  useEffect(() => {
    setSortedByAfter(false);

    const timer = window.setTimeout(() => {
      setSortedByAfter(true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [results]);

  /*
   * Chaque joueur garde son identité.
   * On calcule simplement sa position avant et après.
   */
  const positionsBefore = new Map(
    beforeResults.map((result, index) => [
      result.playerId,
      index,
    ])
  );

  const positionsAfter = new Map(
    afterResults.map((result, index) => [
      result.playerId,
      index,
    ])
  );

  if (!results.length) {
    return null;
  }

  const ROW_HEIGHT = 52;
  const ROW_GAP = 8;
  const ROW_SIZE = ROW_HEIGHT + ROW_GAP;

  return (
	<div
	className="
		absolute
		left-1/2
		top-1/2
		z-[9998]
		w-[32%]
		min-w-[260px]
		-translate-x-1/2
		-translate-y-1/2
		pointer-events-none
	"
	>
		<div
		className="
			pointer-events-auto
			flex
			aspect-[2/3]
			w-[90vw]
			max-w-[300px]
			flex-col
			rounded-3xl
			border-8
			border-white
			bg-bdarkgreen
			p-4
			shadow-2xl
			balatro-star
		"
		>

        {/* TITRE */}
        <h2 className="mb-4 shrink-0 text-center text-xl font-black text-white sm:text-2xl">
          🏆 Résultats du tour
        </h2>

        {/* HEADER */}
        <div
          className="
            grid
            shrink-0
            grid-cols-[1.5fr_0.8fr_1fr_1fr_1fr]
            items-center
            gap-x-3
            px-3
            pb-2
            text-center
            text-[8px]
            font-black
            uppercase
            text-white/50
          "
        >
          <span className="text-left">Joueur</span>
          <span>Résultat</span>
          <span>Avant</span>
          <span>Gain</span>
          <span>Après</span>
        </div>

        {/* RESULTATS */}
        <div
          className="relative flex-1"
          style={{
            minHeight: results.length * ROW_SIZE,
          }}
        >
          {beforeResults.map((result, index) => {
            const player = players.find(
              (p) => p.playerId === result.playerId
            );

            const playerNumber = player?.playerNumber ?? 0;
				console.log("player numbeer = %d\n",playerNumber);

            const color =
              chipColors[
                Math.abs(playerNumber) % chipColors.length
              ];

            const beforePosition =
              positionsBefore.get(result.playerId) ?? index;

            const afterPosition =
              positionsAfter.get(result.playerId) ?? index;

            const position = sortedByAfter
              ? afterPosition
              : beforePosition;

            return (
              <div
                key={result.playerId}
                className={`
                  absolute
                  left-0
                  grid
                  h-[52px]
                  w-full
                  grid-cols-[1.5fr_0.8fr_1fr_1fr_1fr]
                  items-center
                  gap-x-3
                  rounded-xl
                  border-2
                  px-3
                  text-center
                  text-[10px]
                  font-bold
                  text-white

                  ${color.bg}
                  ${color.border}
                  ${color.shadow}
                `}
                style={{
                  top: `${position * ROW_SIZE}px`,
                  transition:
                    "top 800ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {/* JOUEUR */}
                <div className="flex min-w-0 flex-col items-center justify-center text-center">
                  <span className="w-fit truncate">
                    {result.username ?? result.playerId}
                  </span>

                  {result.playerId === playerId && (
                    <span className="h-fit w-fit text-[8px] text-white/60">
                      (toi)
                    </span>
                  )}
                </div>

                {/* RESULTAT */}
                <div className="whitespace-nowrap">
                  {result.result}
                </div>

                {/* AVANT */}
                <div className="whitespace-nowrap">
                  {result.balanceBefore}
                </div>

                {/* GAIN */}
                <div
                  className={
                    result.gain >= 0
                      ? "whitespace-nowrap text-green-200"
                      : "whitespace-nowrap text-red-200"
                  }
                >
                  {result.gain >= 0 ? "+" : ""}
                  {result.gain}
                </div>

                {/* APRES */}
                <div className="whitespace-nowrap">
                  {result.balanceAfter}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}