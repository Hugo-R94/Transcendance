import type { Result } from "../../types/gambling";

type MyResultProps = {
  result: Result | null;
};

export function MyResult({ result }: MyResultProps) {
  const isVisible = !!result;

  return (
    <section
      className={`
        absolute
        left-1/2
        top-1/2
        z-500
        w-[32%]
        min-w-[260px]
        -translate-x-1/2
        -translate-y-1/2
        transition-all
        duration-700
        ease-out
        ${
          isVisible
            ? "translate-x-[-50%] opacity-100"
            : "translate-x-[100vw] opacity-0 pointer-events-none"
        }
      `}
    >
      <div
        className={`
          relative
          w-full
          transition-all
          duration-500
          ease-out
          ${
            isVisible
              ? "rotate-0 scale-100"
              : "rotate-[18deg] scale-80"
          }
        `}
      >
        <div
          className={`
            balatro-star
            relative
            flex
            min-h-[220px]
            w-full
            aspect-[125/190]
            flex-col
            items-center
            justify-center
            overflow-hidden
            rounded-3xl
            p-6
            text-center
            shadow-2xl
            outline
            outline-white/20
            shadow-black/80
            ${
              result && result.gain >= 0
                ? "bg-gradient-to-br from-[#3c9b71]/90 to-[#176b4a]/90"
                : "bg-gradient-to-br from-[#fb4740]/90 to-[#a51f1b]/90"
            }
          `}
        >
          {/* Image en arrière-plan */}
          <img
            src="https://balatrowiki.org/images/The_Wheel_of_Fortune.png?2b7b8"
            alt="Wheel of Fortune"
            className="
              pointer-events-none
              absolute
              inset-0
              h-full
              w-full
              scale-105
              object-cover
              opacity-80
              mix-blend-overlay
            "
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Contenu */}
          {result && (
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/70 drop-shadow">
                Mon résultat
              </span>

              <h2 className="mt-2 text-2xl font-bl ack uppercase text-white drop-shadow-md">
                {result.result}
              </h2>

              <strong className="mt-2 text-5xl font-black text-white drop-shadow-lg">
                {result.gain >= 0 ? "+" : ""}
                {result.gain}
              </strong>

              <div className="mt-5 flex gap-3">
                <div className="rounded-xl bg-black/20 px-4 py-2 backdrop-blur-sm">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Avant
                  </span>

                  <strong className="text-sm text-white">
                    {result.balanceBefore}
                  </strong>
                </div>

                <div className="rounded-xl bg-black/20 px-4 py-2 backdrop-blur-sm">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Après
                  </span>

                  <strong className="text-sm text-white">
                    {result.balanceAfter}
                  </strong>
                </div>
              </div>

              <span className="mt-4 rounded-full bg-black/30 px-4 py-1 text-xs font-bold text-white/80 backdrop-blur-sm">
                {result.gain >= 0 ? "✓ GAIN" : "✕ PERDU"}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
