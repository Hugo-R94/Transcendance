import { useNavigate } from "react-router-dom";

type InviteProps = {
  color: string;
  roomId: string;
};

export default function InviteGame({
  color,
  roomId,
}: InviteProps) {
  const navigate = useNavigate();

  const text_color =
    color === "bg-bred" ? "text-bblue" : "text-byellow";

  const handleJoin = () => {
    if (!roomId.trim()) {
      return;
    }

    navigate(`/clicker?room=${encodeURIComponent(roomId.trim())}`);
  };

  return (
    <div
      className={`flex flex-col items-center gap-y-1 card w-50 h-20 rounded-2xl gap-x-2 text-xs justify-center p-3 ${color}`}
    >
      <div className="flex gap-x-1">
        <p className="font-extrabold">JOIN ROOM :</p>

        <p className={`font-extrabold ${text_color}`}>
          {roomId}
        </p>
      </div>

      <button
        onClick={handleJoin}
        className="bg-bgreen w-1/2 h-full balatro rounded-2xl shadow-black/50 shadow-md active:scale-90 active:outline-3 font-extrabold"
      >
        JOIN
      </button>
    </div>
  );
}