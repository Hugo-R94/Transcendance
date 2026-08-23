import type { Result } from "../../types/gambling";

type MyResultProps = {
  result: Result | null;
};

export function MyResult({ result }: MyResultProps) {
  const visible = !!result;

  return (
    <section
      className={`absolute left-1/2 top-1/2 z-50 w-[32%] min-w-[280px] -translate-y-1/2
        transition-all duration-700 ease-out
        ${visible
          ? "translate-x-[-50%] rotate-0 scale-100 opacity-100"
          : "translate-x-[100vw] rotate-6 scale-90 opacity-0"}
        ${!visible ? "pointer-events-none" : ""}`}
    >
      {result && (
        <div
          className={`relative flex min-h-[260px] w-full flex-col items-center justify-center
            overflow-hidden rounded-3xl p-6 text-center shadow-2xl
            ${result.gain >= 0
              ? "bg-gradient-to-br from-[#3c9b71] to-[#176b4a]"
              : "bg-gradient-to-br from-[#fb4740] to-[#a51f1b]"}`}
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
            Mon résultat
          </span>

          <span className="mt-2 text-5xl">
            {result.gain >= 0 ? "🎉" : "💀"}
          </span>

          <h2 className="mt-2 text-2xl font-black text-white">
            {result.result}
          </h2>

          <strong className="mt-2 text-5xl font-black text-white">
            {result.gain >= 0 ? "+" : ""}{result.gain}
          </strong>

          <div className="mt-4 flex gap-3">
            <div className="rounded-xl bg-black/15 px-4 py-2">
              <span className="block text-[10px] uppercase text-white/50">Avant</span>
              <strong className="text-sm text-white">{result.balanceBefore}</strong>
            </div>
            <div className="rounded-xl bg-black/15 px-4 py-2">
              <span className="block text-[10px] uppercase text-white/50">Après</span>
              <strong className="text-sm text-white">{result.balanceAfter}</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}