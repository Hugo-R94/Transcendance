import { useTranslation } from "react-i18next";

type PhaseTimerProps = {
  state: string;
  countdown: number | null;
  turn: number,
};

export function PhaseTimer({
  state,
  countdown,
  turn,
}: PhaseTimerProps) {
  const { t } = useTranslation();

  const getLabel = () => {
    switch (state) {
      case "betting":
        return t("phaseTimer.phases.betting");

      case "scratch":
        return t("phaseTimer.phases.scratch");

      case "spinning":
        return t("phaseTimer.phases.spinning");

      case "resolving":
        return t("phaseTimer.phases.resolving");

      case "finished":
        return t("phaseTimer.phases.finished");

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
            {t("phaseTimer.remains")}
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
          {t("phaseTimer.turn")}
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
          {t("phaseTimer.phase")}
        </span>

        <strong>
          {getLabel()}
        </strong>
      </div>

    </div>

  );
}