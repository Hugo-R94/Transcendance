import { useGambling } from "../../use/useGambling";

type PhaseTimerProps = {
  state: string;
  countdown: number | null;
  turn:	number,
};

export function PhaseTimer({
  state,
  countdown,
  turn,
}: PhaseTimerProps) {
  const getLabel = () => {
    switch (state) {
      case "betting":
        return "PARIS";

      case "scratch":
        return "TICKET À GRATTER";

      case "spinning":
        return "ROULETTE";

      case "resolving":
        return "RÉSULTAT";

      case "finished":
        return "PARTIE TERMINÉE";

      default:
        return state;
    }
  };

  return (
	<div className="flex h-fit sm:w-full w-[90%] items-center gap-4">

	{/* TIMER */}
	<div className="flex sm:h-full h-10 flex-1 items-center justify-center rounded-2xl bg-bred p-2 card">
		<div
		className="flex items-center justify-center gap-2 whitespace-nowrap"
		style={{
			fontSize: "clamp(0.6rem, 1.2vw, 1rem)",
		}}
		>
		<span className="font-semibold">
			REMAINS:
		</span>

		<strong>
			{countdown}s
		</strong>
		</div>
	</div>

	{/* TURN */}
	<div
		className="flex sm:h-full h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-bgreen p-2 card whitespace-nowrap"
		style={{
		fontSize: "clamp(0.6rem, 1.2vw, 1rem)",
		}}
	>
		<span className="font-semibold">
		Turn:
		</span>

		<strong>
		{turn}
		</strong>
	</div>

	{/* PHASE */}
	<div
		className="flex sm:h-full h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-bgreen p-2 card whitespace-nowrap"
		style={{
		fontSize: "clamp(0.55rem, 1vw, 1rem)",
		}}
	>
		<span className="font-semibold">
		Phase:
		</span>

		<strong>
		{getLabel()}
		</strong>
	</div>

	</div>

  );
}
