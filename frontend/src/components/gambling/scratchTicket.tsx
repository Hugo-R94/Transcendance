import { useTranslation } from "react-i18next";
import type { Ticket } from "../../api/gambling";

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
  const { t } = useTranslation();
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
              ? "translate-x-0 rotate-3 scale-100"
              : "translate-x-[100vw] rotate-[18deg] scale-80"
          }
        `}
      >
        <div
          className={`
			balatro-star
            relative ouline-z outline-white shadow-lg shadow-black/80
            flex
            min-h-[220px]
            w-full
            aspect-[125/190]
            items-center
            justify-center
            overflow-hidden
            rounded-3xl
            p-6
            shadow-2xl
            ${
              ticket
                ? ticket.type === "bonus"
                  ? "bg-gradient-to-br from-[#3c9b71]/90 to-[#176b4a]/90"
                  : "bg-gradient-to-br from-[#fb4740]/90 to-[#a51f1b]/90"
                : "bg-gradient-to-br from-[#ed8a00]/90 to-[#a95500]/90"
            }
          `}
		  
        >
          {/* Image en arrière-plan */}
          <img 
            src="https://balatrowiki.org/images/The_Wheel_of_Fortune.png?2b7b8" 
            alt="Wheel of Fortune"
            className="absolute scale-105 inset-0 h-full w-full object-cover opacity-80 mix-blend-overlay pointer-events-none "
          />

          {/* Contenu principal */}
          <div className="relative z-10 flex h-full w-full items-center justify-center " >
            {!ticket ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="text-5xl">🎟️</span>

                <div>
                  <h2 className="text-xl font-black text-white drop-shadow-md">
                    {t("scratchTicket.mysteryTitle")}
                  </h2>

                  <p className="mt-1 text-sm text-white/80 drop-shadow">
                    {t("scratchTicket.revealSubtitle")}
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
                  {t("scratchTicket.scratchButton")}
                </button>

                {countdown !== null && countdown > 0 && (
                  <span className="text-xs font-bold text-white/70">
                    {countdown}s
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-sm font-bold uppercase tracking-widest text-white/80 drop-shadow">
                  {t("scratchTicket.yourTicket")}
                </span>

                <span className="text-5xl">
                  {ticket.type === "bonus" ? "🎁" : "💀"}
                </span>

                <h2 className="text-2xl font-black text-white drop-shadow-md">
                  {ticket.type === "bonus" ? t("scratchTicket.bonus") : t("scratchTicket.malus")}
                </h2>

                <strong className="text-5xl font-black text-white drop-shadow-md">
                  {ticket.value >= 0 ? "+" : ""}
                  {ticket.value * 100}%
                </strong>

                <span className="mt-2 rounded-full bg-black/30 px-4 py-1 text-xs font-bold text-white/80 backdrop-blur-sm">
                  {t("scratchTicket.revealed")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}