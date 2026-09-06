import { useTranslation } from "react-i18next";
import { useUserAvatar } from "../../api/getUserAvatar";

function RequestAvatar({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const avatarUrl = useUserAvatar(userId);

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/20 flex items-center justify-center font-bold text-white text-sm bg-black/20 shadow-md">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{username?.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

export default function FriendRequestList({
  requests,
  onAccept,
  onReject,
  onBlock,
}: {
  requests: any[];
  onAccept: (req: any) => void;
  onReject: (req: any) => void;
  onBlock: (req: any) => void;
}) {
  const { t } = useTranslation();

  if (!requests || requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/50 text-sm">
        {t("friendRequestList.noRequests")}
      </div>
    );
  }

  const colors = [
    "bg-byellow",
    "bg-bred",
    "bg-bblue",
    "bg-bgreen",
  ];

  return (
    <div className="overflow-y-auto overflow-x-visible h-full">
      <div className="flex flex-col gap-3 p-3 overflow-x-visible">
        {requests.map((req, index) => {

          const keyId = req.id;

          const avatarUserId = req.id;

          const username = req.username || t("chat.defaultUsername");
          const bgColor = colors[index % colors.length];
          return (
            <div
              key={keyId}
              className={`relative flex items-center justify-between p-3 rounded-2xl ${bgColor} shadow-md transition-all group`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <RequestAvatar
                  userId={avatarUserId}
                  username={username}
                />

                <div className="flex flex-col min-w-0">
                  <span className="text-white font-bold text-md truncate">
                    {username}
                  </span>

                  <span className="text-white/70 text-xs">
                    {t("friendRequestList.friendRequestLabel")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onAccept(req)}
                  className="bg-black/20 w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center hover:bg-green-600 hover:outline-2 hover:outline-white active:scale-90 transition-all cursor-pointer balatro"
                  title={t("friendRequestList.accept")}
                >
                  ✓
                </button>

                <button
                  onClick={() => onReject(req)}
                  className="bg-black/20 w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center hover:bg-red-600 hover:outline-2 hover:outline-white active:scale-90 transition-all cursor-pointer balatro"
                  title={t("friendRequestList.reject")}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
