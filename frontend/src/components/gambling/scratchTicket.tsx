import type { Ticket } from "../../types/gambling";

type ScratchTicketProps = {
  state: string;
  hasBet: boolean;
  ticket: Ticket | null;
  countdown: number | null;
  scratch: () => void;
};

export function ScratchTicket({
  state,
  hasBet,
  ticket,
  countdown,
  scratch,
}: ScratchTicketProps) {
  const isVisible = state === "scratch";

  const disabled =
    !hasBet ||
    !!ticket ||
    countdown === 0;

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
        duration-500
        ease-out
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      <div
        className={`
          w-full
          transition-all
          duration-500
          ease-out
          ${
            isVisible
              ? "translate-x-0 rotate-0 scale-100"
              : "translate-x-[120vw] rotate-[12deg] scale-90"
          }
        `}
      >
        <div
          className={`
            relative
            flex
            min-h-[220px]
            w-full
            items-center
            justify-center
            overflow-hidden
            rounded-3xl
            p-6
            shadow-2xl
            ${
              ticket
                ? ticket.type === "bonus"
                  ? "bg-gradient-to-br from-[#3c9b71] to-[#176b4a]"
                  : "bg-gradient-to-br from-[#fb4740] to-[#a51f1b]"
                : "bg-gradient-to-br from-[#ed8a00] to-[#a95500]"
            }
          `}
        >
          {!ticket ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="text-5xl">🎟️</span>

              <div>
                <h2 className="text-xl font-black text-white">
                  TICKET MYSTÈRE
                </h2>

                <p className="mt-1 text-sm text-white/70">
                  Révèle ton bonus
                </p>
              </div>

              <button
                onClick={scratch}
                disabled={disabled}
                className="
                  rounded-xl
                  bg-white
                  px-7
                  py-3
                  font-black
                  text-[#a95500]
                  shadow-lg
                  transition-all
                  hover:scale-105
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                ✨ GRATTER
              </button>

              {countdown !== null && countdown > 0 && (
                <span className="text-xs font-bold text-white/60">
                  {countdown}s
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-sm font-bold uppercase tracking-widest text-white/70">
                Ton ticket
              </span>

              <span className="text-5xl">
                {ticket.type === "bonus" ? "🎁" : "💀"}
              </span>

              <h2 className="text-2xl font-black text-white">
                {ticket.type === "bonus" ? "BONUS" : "MALUS"}
              </h2>

              <strong className="text-5xl font-black text-white">
                {ticket.value >= 0 ? "+" : ""}
                {ticket.value * 100}%
              </strong>

              <span className="mt-2 rounded-full bg-black/20 px-4 py-1 text-xs font-bold text-white/70">
                ✓ TICKET RÉVÉLÉ
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}