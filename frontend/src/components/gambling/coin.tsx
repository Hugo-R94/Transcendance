import { useMemo } from "react";
import { useUserAvatar } from "../../api/getUserAvatar";

type CoinProps = {
  userID: string;
  playerNumber: number;
  value?: number;
};

function Coin({
  userID,
  playerNumber,
  value = 100,
}: CoinProps) {
  const myUserID = localStorage.getItem("userID");
  const myUserPP = localStorage.getItem("userPP");

  const chipColors = [
    {
      bg: "bg-bblue",
      border: "border-blue-950",
      shadow:
        "shadow-[0_4px_0_#172554,0_6px_8px_rgba(0,0,0,0.5)]",
    },
    {
      bg: "bg-bred",
      border: "border-red-950",
      shadow:
        "shadow-[0_4px_0_#450a0a,0_6px_8px_rgba(0,0,0,0.5)]",
    },
    {
      bg: "bg-byellow",
      border: "border-yellow-950",
      shadow:
        "shadow-[0_4px_0_#451a03,0_6px_8px_rgba(0,0,0,0.5)]",
    },
    {
      bg: "bg-bgreen",
      border: "border-green-950",
      shadow:
        "shadow-[0_4px_0_#052e16,0_6px_8px_rgba(0,0,0,0.5)]",
    },
  ];

  const color =
    chipColors[
      Math.abs(playerNumber) % chipColors.length
    ];

  const avatar = useUserAvatar(userID);

  const isValidUserID =
    Boolean(userID && userID.trim().length > 0);

  const isMe =
    isValidUserID && userID === myUserID;

  const avatarUrl =
    isMe && myUserPP
      ? myUserPP
      : avatar;

  const randomOffset = useMemo(
    () => ({
      x: Math.floor(Math.random() * 5) - 2,
      y: Math.floor(Math.random() * 3) - 1,
    }),
    [],
  );

  return (
    <div
      className="relative h-10 w-10"
      style={{
        transform: `translate(
          ${randomOffset.x}px,
          ${randomOffset.y}px
        )`,
      }}
    >
		<div
		className={`
			absolute h-9 w-10 rounded-full translate-y-1 border-[1px]
			${color.border}
			${color.bg}
			overflow-hidden
			shadow-sm shadow-black/75
		`}
		>
		<div
		className="
			absolute
			translate-y-1
			inset-0
			rounded-full
			bg-[repeating-linear-gradient(90deg,white_0px,white_4px,transparent_4px,transparent_8px)]
		"
		/>

		</div>
		
		
      <div
        className={`
          absolute left-0 top-[-3px] flex h-10 w-10 flex-col items-center
          justify-center overflow-hidden rounded-full border-3 border-white/95 ${color.bg}
          shadow-[inset_2px_2px_3px_rgba(255,255,255,0.4),inset_-3px_-3px_5px_rgba(0,0,0,0.45)]
        `}
      >
        <img
          src={avatarUrl ?? undefined}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <span className="relative z-10 text-[9px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {value}
        </span>
      </div>
    </div>
  );
}

export default Coin;
