type PhaseTimerProps = {
  state: string;
  countdown: number | null;
};

export function PhaseTimer({
  state,
  countdown,
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
    <div className="flex flex-col h-10 w-full items-center justify-between px-4">


      {countdown !== null && (
        <div className="flex gap-2 bg-bred w-fit h-fit p-2 rounded-2xl card mb-3 justify-center items-center">
          <span className="font-semibold text-xl">REMAINS : </span>

          <p className="text-4xl font-extrabold">
            {countdown}s
          </p>
        </div>
		
      )}
		<div className="bg-bgreen w-fit h-fit p-2 rounded-2xl card">
        Phase :{" "}
        <strong>
          {getLabel()}
        </strong>
      </div>
    </div>
  );
}