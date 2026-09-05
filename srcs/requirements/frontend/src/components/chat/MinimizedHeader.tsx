import { useTranslation } from "react-i18next";
import NotificationSignal from "../utils/notificationSignal";

interface MinimizedHeaderProps {
  username?: string;
  avatar: string | null;
  hasUnread: boolean;
  onRestore: () => void;
}

export default function MinimizedHeader({
  username,
  avatar,
  hasUnread,
  onRestore,
}: MinimizedHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="
      w-full h-full
      flex flex-row
      items-center
      justify-between
      text-white
      px-2
    ">
      <div className="
        flex items-center
        gap-2
        min-w-0
      ">
        {avatar && (
          <div className="
            w-6 h-6
            rounded-full
            bg-byellow
            overflow-hidden
            shrink-0
            flex items-center
            justify-center
            font-bold
            text-xs
          ">
            <img
              src={avatar}
              alt={username}
              className="
                w-full h-full
                object-cover
              "
            />
          </div>
        )}

        <span className="
          font-bold
          text-xs
          tracking-wider
          truncate
          max-w-[90px]
        ">
          {username || t("chatWindow.defaultLabel")}
        </span>

        {hasUnread && <NotificationSignal />}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRestore();
        }}
        className="
          text-xs
          transform
          transition-transform
          duration-500
          rotate-180
          sm:flex hidden
        "
      >
        ▼
      </button>
    </div>
  );
}
