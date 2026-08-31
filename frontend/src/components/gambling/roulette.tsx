import { useEffect, useRef, useState } from "react";

type RouletteProps = {
  winningNumber: number | null;
  rotationDegree: number | null;
  state: string;
  turn: number;
};

const NUMBER_COUNT = 25;
const SLICE = 360 / NUMBER_COUNT;
const ANIMATION_DURATION = 4000;
const SECTOR_GAP = 0.1;

const COLORS = {
  red: "#fb4740",
  green: "#3c9b71",
  black: "#090909",
};

export function Roulette({
  winningNumber,
  rotationDegree,
  state,
  turn,
}: RouletteProps) {
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [ballScale, setBallScale] = useState(1);

  const previousTurn = useRef<number | null>(null);
  const wheelRotationRef = useRef(0);
  const ballRotationRef = useRef(0);

  const ballScaleIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const numbers = Array.from({ length: NUMBER_COUNT }, (_, i) => i);

  const getPoint = (angle: number, radius: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;

    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
    };
  };

  const getSectorPath = (number: number) => {
    const startAngle = number * SLICE + SECTOR_GAP;
    const endAngle = (number + 1) * SLICE - SECTOR_GAP;

    const start = getPoint(startAngle, 50);
    const end = getPoint(endAngle, 50);

    return `
      M 50 50
      L ${start.x} ${start.y}
      A 50 50 0 0 1 ${end.x} ${end.y}
      Z
    `;
  };

  useEffect(() => {
    if (state !== "spinning") return;

    if (winningNumber === null) {
      console.warn("[ROULETTE] winningNumber manquant");
      return;
    }

    if (rotationDegree === null) {
      console.warn("[ROULETTE] rotationDegree manquant");
      return;
    }

    if (previousTurn.current === turn) return;

    previousTurn.current = turn;

    const currentWheelAngle =
      ((wheelRotationRef.current % 360) + 360) % 360;

    const winningCellAngle = winningNumber * SLICE;

    let wheelDelta =
      rotationDegree -
      winningCellAngle -
      currentWheelAngle;

    wheelDelta = ((wheelDelta + 180) % 360) - 180;

    const wheelTurns = 5;

    wheelDelta += wheelTurns * 360;

    const cellStartAngle = rotationDegree;
    const cellCenterAngle = rotationDegree + SLICE / 2;

    const preferredBallAngle =
      (cellStartAngle + cellCenterAngle) / 2;

    const randomOffset = Math.random() * 4 - 2;

    const targetBallAngle =
      preferredBallAngle + randomOffset;

    const currentBallAngle =
      ((ballRotationRef.current % 360) + 360) % 360;

    let ballDelta =
      targetBallAngle - currentBallAngle;

    ballDelta = ((ballDelta + 180) % 360) - 180;

    const ballTurns = 8;

    ballDelta -= ballTurns * 360;

    console.log("[ROULETTE] RESULTAT", {
      turn,
      winningNumber,
      rotationDegree,
      currentWheelAngle,
      winningCellAngle,
      wheelDelta,
      currentBallAngle,
      cellStartAngle,
      cellCenterAngle,
      preferredBallAngle,
      randomOffset,
      targetBallAngle,
      ballDelta,
    });

    if (ballScaleIntervalRef.current) {
      clearInterval(ballScaleIntervalRef.current);
      ballScaleIntervalRef.current = null;
    }

    setBallScale(1);

    ballScaleIntervalRef.current = setInterval(() => {
      const randomScale = 0.55 + Math.random() * 0.8;

      setBallScale(randomScale);
    }, 60);

    setSpinning(false);

    const frame1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSpinning(true);

        wheelRotationRef.current += wheelDelta;
        ballRotationRef.current += ballDelta;

        setWheelRotation(wheelRotationRef.current);
        setBallRotation(ballRotationRef.current);
      });
    });

    const timeout = window.setTimeout(() => {
      setSpinning(false);
      setBallScale(1);

      if (ballScaleIntervalRef.current) {
        clearInterval(ballScaleIntervalRef.current);
        ballScaleIntervalRef.current = null;
      }
    }, ANIMATION_DURATION);

    return () => {
      cancelAnimationFrame(frame1);
      clearTimeout(timeout);

      if (ballScaleIntervalRef.current) {
        clearInterval(ballScaleIntervalRef.current);
        ballScaleIntervalRef.current = null;
      }
    };
  }, [state, turn, winningNumber, rotationDegree]);

  useEffect(() => {
    if (
      state === "betting" ||
      state === "scratch" ||
      state === "waiting"
    ) {
      previousTurn.current = null;
    }
  }, [state]);

  useEffect(() => {
    return () => {
      if (ballScaleIntervalRef.current) {
        clearInterval(ballScaleIntervalRef.current);
        ballScaleIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <section className="flex flex-col h-full w-full items-center">

      {/* ROUE */}
      <div
        className="
          relative h-full w-full shrink-0 rounded-full
          border-[3px] border-[#171717]
          bg-[#090909]
          shadow-[0_20px_60px_rgba(0,0,0,0.75)]
        "
      >

        {/* ROUE QUI TOURNE */}
        <div
          className={`
            absolute inset-0 rounded-full
            ${
              spinning
                ? "transition-transform duration-[4000ms] ease-[cubic-bezier(0.08,0.78,0.12,1)]"
                : ""
            }
          `}
          style={{
            transform: `rotate(${wheelRotation}deg)`,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full"
          >

            {/* CELLULES */}
            {numbers.map((number) => {
              let color = COLORS.green;

              if (number === 0) {
                color = COLORS.black;
              } else if (number % 2 === 1) {
                color = COLORS.red;
              }

              return (
                <path
                  key={number}
                  d={getSectorPath(number)}
                  fill={color}
                  stroke="#111"
                  strokeWidth="0.5"
                />
              );
            })}

            {/* NUMÉROS */}
            {numbers.map((number) => {
              const angle =
                number * SLICE + SLICE / 2;

              const point = getPoint(angle, 39);

              return (
                <text
                  key={`number-${number}`}
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="4.5"
                  fontWeight="900"
                  style={{
                  }}
                >
                  {number}
                </text>
              );
            })}



            <circle
              cx="50"
              cy="50"
              r="5"
              fill="#181818"
              stroke="#3a3a3a"
              strokeWidth="1.5"
            />

          </svg>
        </div>

        {/* BILLE */}
        <div
          className={`
            pointer-events-none absolute inset-0
            ${
              spinning
                ? "transition-transform duration-[4000ms] ease-[cubic-bezier(0.08,0.78,0.12,1)]"
                : ""
            }
          `}
          style={{
            transform: `rotate(${ballRotation}deg)`,
          }}
        >
          <div className="absolute left-1/2 top-[5%] -translate-x-1/2">
            <div
              className="
                h-4 w-4 rounded-full
                border-b-10 border-black/25
                bg-white
                shadow-[0_3px_6px_rgba(0,0,0,0.5)]
                transition-transform duration-75
              "
              style={{
                transform: `scale(${ballScale})`,
              }}
            />
          </div>
        </div>

        {/* MOYEU */}
        <div
          className={`
            pointer-events-none absolute inset-0 z-30
            ${
              spinning
                ? "transition-transform duration-[4000ms] ease-[cubic-bezier(0.08,0.78,0.12,1)]"
                : ""
            }
          `}
          style={{
            transform: `rotate(${wheelRotation}deg)`,
          }}
        >

          {/* CENTRE */}
          <div
            className="
              pointer-events-none absolute left-1/2 top-1/2
              h-9 w-9 -translate-x-1/2 -translate-y-1/2
              rounded-full border-[12px] border-black/25
              bg-byellow shadow-xl
            "
          />

          {/* BARRE */}
          <div
            className="
              pointer-events-none absolute left-1/2 top-1/2
              h-2 w-14 -translate-x-1/2 -translate-y-1/2
              rounded-lg border-t-[5px] border-black/25
              bg-byellow shadow-xl
            "
          >

            {/* GAUCHE */}
            <div
              className="
                pointer-events-none absolute left-1/2 top-1/2
                h-3 w-3 -translate-x-[34px] -translate-y-[10px]
                rounded-full border-t-[7px] border-black/25
                bg-byellow shadow-md
              "
            />

            {/* DROITE */}
            <div
              className="
                pointer-events-none absolute left-1/2 top-1/2
                h-3 w-3 translate-x-[22px] -translate-y-[10px]
                rounded-full border-t-[7px] border-black/25
                bg-byellow shadow-xl
              "
            />

          </div>
        </div>
      </div>

      {/* MESSAGE
          La hauteur est TOUJOURS réservée.
          Seul le texte devient invisible.
      */}
      <div className="mt-5 h-5 text-sm font-bold text-white/60">
        <span
          className={
            state === "spinning"
              ? "visible"
              : "invisible"
          }
        >
          🎰 Roulette en cours
        </span>
      </div>

    </section>
  );
}
