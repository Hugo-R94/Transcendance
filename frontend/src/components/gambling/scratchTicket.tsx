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
  const disabled =
    state !== "scratch" ||
    !hasBet ||
    !!ticket ||
    countdown === 0;

  return (
    <section>

      <button
        onClick={scratch}
        disabled={disabled}
      >
        {ticket
          ? "✓ TICKET GRATÉ"
          : "✨ GRATTER LE TICKET"}
      </button>

      {ticket && (
        <div>
          <small>
            Ton ticket
          </small>

          <h3>
            {ticket.type ===
            "bonus"
              ? "🎁 BONUS"
              : "💀 MALUS"}
          </h3>

          <strong>
            {ticket.value >= 0
              ? "+"
              : ""}
            {ticket.value * 100}%
          </strong>
        </div>
      )}

    </section>
  );
}