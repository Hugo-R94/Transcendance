import { useMemo } from "react";

type ChipProps = {
  value: number;
  userID: string;
  playerNumber: number;
};

type ChipOffset = { x: number; y: number };

function Chip({ value, userID, playerNumber }: ChipProps) {
  const myUserID = localStorage.getItem("userID");
  const myUserPP = localStorage.getItem("userPP");

  const chipColors = [
    { bg: "bg-bblue", border: "border-blue-950", shadow: "shadow-[0_4px_0_#172554,0_6px_8px_rgba(0,0,0,0.5)]" },
    { bg: "bg-bred", border: "border-red-950", shadow: "shadow-[0_4px_0_#450a0a,0_6px_8px_rgba(0,0,0,0.5)]" },
    { bg: "bg-byellow", border: "border-yellow-950", shadow: "shadow-[0_4px_0_#451a03,0_6px_8px_rgba(0,0,0,0.5)]" },
    { bg: "bg-bgreen", border: "border-green-950", shadow: "shadow-[0_4px_0_#052e16,0_6px_8px_rgba(0,0,0,0.5)]" },
  ];

  const color = chipColors[Math.abs(playerNumber) % chipColors.length];

  const fallbackAvatar = useMemo(
    () => `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
    [],
  );

  const isValidUserID = Boolean(userID && userID.trim().length > 0);
  const isMe = isValidUserID && userID === myUserID;

  const avatarUrl =
    isMe && myUserPP
      ? myUserPP
      : fallbackAvatar;

  const randomPosition = useMemo(
    () => ({
      x: Math.floor(Math.random() * 9) - 4,
      y: Math.floor(Math.random() * 7) - 3,
    }),
    [],
  );

  const chipOffsets = useMemo<ChipOffset[]>(() => {
    const randomOffset = (xRange: number, yRange: number): ChipOffset => ({
      x: Math.floor(Math.random() * (xRange * 2 + 1)) - xRange,
      y: Math.floor(Math.random() * (yRange * 2 + 1)) - yRange,
    });

    return [randomOffset(2, 1), randomOffset(2, 1), randomOffset(2, 1)];
  }, []);

  return (
    <div
      className="pointer-events-none absolute -right-3 -top-5 z-[40] h-16 w-16"
      style={{ transform: `translate(${randomPosition.x}px, ${randomPosition.y}px)` }}
    >
      <div
        className={`absolute h-10 w-10 rounded-full border-4 ${color.border} ${color.bg} ${color.shadow}`}
        style={{ left: chipOffsets[0].x, top: 8 + chipOffsets[0].y }}
      />

      <div
        className={`absolute h-10 w-10 rounded-full border-4 ${color.border} ${color.bg} shadow-[0_3px_0_rgba(0,0,0,0.45)]`}
        style={{ left: chipOffsets[1].x, top: 4 + chipOffsets[1].y }}
      />

      <div
        className={`absolute flex h-10 w-10 flex-col items-center justify-center overflow-hidden rounded-full border-4 ${color.border} ${color.bg} shadow-[inset_2px_2px_3px_rgba(255,255,255,0.4),inset_-3px_-3px_5px_rgba(0,0,0,0.45)]`}
        style={{ left: chipOffsets[2].x, top: chipOffsets[2].y }}
      >
        <img
          src={avatarUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <span className="relative z-10 text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {value}
        </span>
      </div>
    </div>
  );
}

export default Chip;