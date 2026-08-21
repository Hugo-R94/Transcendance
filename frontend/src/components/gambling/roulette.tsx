type RouletteProps = {
  winningNumber: number | null;
  state: string;
};

export function Roulette({
  winningNumber,
  state,
}: RouletteProps) {
  const isGreen =
    winningNumber === 0;

  const isRed =
    winningNumber !== null &&
    winningNumber !== 0 &&
    winningNumber % 2 !== 0;

  const color = isGreen
    ? "bg-bgreen"
    : isRed
    ? "bg-bred"
    : "bg-black";

  return (
    <section className="flex flex-col items-center gap-4">

      <h2 className="text-2xl font-black">
        Roulette
      </h2>

      <div
        className={`
          ${color}
          flex
          h-48
          w-48
          items-center
          justify-center
          rounded-full
          border-8
          border-white/20
          shadow-2xl
        `}
      >

        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-black shadow-inner">

          <span className="text-5xl font-black">
            {winningNumber ?? "?"}
          </span>

        </div>

      </div>

      {state === "spinning" && (
        <div className="text-sm font-bold text-white/60">
          🎡 Roulette en cours
        </div>
      )}

      {winningNumber !== null && (
        <div className="text-center">
          <small className="block text-xs font-bold text-white/50">
            NUMÉRO GAGNANT
          </small>

          <strong className="text-xl">
            {winningNumber}
          </strong>
        </div>
      )}

    </section>
  );
}