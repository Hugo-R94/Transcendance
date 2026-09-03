import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { Friend } from "../../api/chat";
import NotificationSignal from "../utils/notificationSignal";

interface ChatHeaderProps {
  otherUser?: Friend;
  otherUserAvatar: string | null;
  hasUnread: boolean;
  onMinimize: () => void;
  onClose: () => void;
  stopPropagation: (e: React.MouseEvent) => void;
}

export default function ChatHeader({
  otherUser,
  otherUserAvatar,
  hasUnread,
  onMinimize,
  onClose,
  stopPropagation,
}: ChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="
      flex items-center gap-2
      h-15 px-2
      bg-white/10
      shrink-0
      rounded-xl
      min-w-0
    ">
      {otherUser?.id && (
        <Link
          to={`/profil/${otherUser.id}`}
          onClick={stopPropagation}
          className="bg-byellow w-10 h-10 rounded-full balatro
            font-bold overflow-visible shrink-0  hover:outline-2
            hover:outline-white transition-all flex items-center 
            justify-center text-white">
          {otherUserAvatar ? (
            <img
              src={otherUserAvatar}
              alt={otherUser.username}
              className="
                w-full h-full
                object-cover
                rounded-full
              "
            />
          ) : (
            <span>
              {otherUser.username
                ?.charAt(0)
                .toUpperCase()}
            </span>
          )}
        </Link>
      )}

      {hasUnread && (
        <div className="
          shrink-0
          flex items-center
          justify-center
        ">
          <NotificationSignal />
        </div>
      )}

      <Link
        to={`/profil/${otherUser?.id}`}
        onClick={stopPropagation}
        className="text-white font-bold  truncate hover:underline
          flex-1 min-w-0 ">
        {otherUser?.username || t("chat.defaultUsername")}
      </Link>

      {/* Minimize */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMinimize();
        }}
        className="bg-byellow w-8 h-8 rounded-xl balatro sm:flex hidden
          items-center  justify-center font-bold text-white hover:outline-2
          hover:outline-white active:scale-90 transition-all shrink-0">
        ▼
      </button>

      {/* Close */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="bg-byellow flex justify-center items-center w-8 h-8
          text-white  balatro rounded-xl font-bold hover:outline-2 hover:outline-white
          active:scale-90 transition-all shrink-0 ">
        <span className="text-3xl leading-none -translate-y-[2px]">
          ×
        </span>
      </button>
    </div>
  );
}
