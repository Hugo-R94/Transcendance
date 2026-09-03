import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type InviteProps = {
  color: string;
  roomId: string;
};

export default function InviteGame({
  color,
  roomId,
}: InviteProps) {
  const { t } = useTranslation();
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
        <p className="font-extrabold">{t("inviteGame.joinRoom")}</p>

        <p className={`font-extrabold ${text_color}`}>
          {roomId}
        </p>
      </div>

      <button
        onClick={handleJoin}
        className="bg-bgreen w-1/2 h-full balatro rounded-2xl shadow-black/50 shadow-md active:scale-90 active:outline-3 font-extrabold"
      >
        {t("inviteGame.join")}
      </button>
    </div>
  );
}
