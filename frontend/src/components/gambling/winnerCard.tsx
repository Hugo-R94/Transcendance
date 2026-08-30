import type { Player } from "../../api/gambling";

type WinnerCardProps = {
  winner: Player;
  score: number;
};

export function WinnerCard({
  winner,
  score,
}: WinnerCardProps) {
  return (
    <div
      className="
        absolute
        left-1/2
        top-1/2
        z-[9998]
        -translate-x-1/2
        -translate-y-1/2
        pointer-events-none
      "
    >
      <div
        className="
          pointer-events-auto
          flex
          w-[90vw]
          max-w-[300px]
          flex-col
          items-center
          justify-center
          rounded-3xl
          border-8
          border-white
          bg-bdarkgreen
          px-8
          py-10
          text-center
          shadow-2xl
          balatro-star
        "
      >
        {/* TITRE */}
        <div className="mb-4 text-4xl">
          🏆
        </div>

        <h2 className="mb-6 text-xl font-black uppercase text-white sm:text-2xl">
          Vainqueur
        </h2>

        {/* NOM */}
        <div
          className="
            mb-4
            max-w-full
            truncate
            text-2xl
            font-black
            text-white
            sm:text-3xl
          "
        >
          {winner.username ?? winner.playerId}
        </div>

        {/* SCORE */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-black uppercase text-white/50">
            Score
          </span>

          <span
            className="
              mt-1
              text-4xl
              font-black
              text-byellow
              drop-shadow-[0_3px_0_#451a03]
              sm:text-5xl
            "
          >
            {score}
          </span>
        </div>
      </div>
    </div>
  );
}
