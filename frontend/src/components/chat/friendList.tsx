import { useTranslation } from "react-i18next";
import { useUserAvatar } from "../../api/getUserAvatar";
import DropdownMenu from "../utils/dropdownFilter";
import NotificationSignal from "../utils/notificationSignal";

function FriendAvatar({
  friendId,
  username,
}: {
  friendId: string;
  username: string;
}) {
  const avatarUrl = useUserAvatar(friendId);

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

export default function FriendList({
  friends,
  onFriendClick,
  onUnfriend,
  onBlock,
  unreadUserIds,
}: {
  friends: any[];
  onFriendClick: (friend: any) => void;
  onUnfriend: (friend: any) => void;
  onBlock: (friend: any) => void;
  unreadUserIds: string[];
}) {
  const { t } = useTranslation();

  if (!friends || friends.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/50 text-sm">
        {t("friendList.noFriends")}
      </div>
    );
  }

  const colors = [
    "bg-byellow",
    "bg-bred",
    "bg-bblue",
    "bg-bgreen",
  ];

  const handleMenuAction = async (
    action: string,
    friend: any
  ) => {
    try {
      if (action === "block") {
        onBlock(friend);
      } else if (action === "delete") {
        onUnfriend(friend);
      }
    } catch (error) {
      console.error(
        `Erreur lors de l'action ${action} :`,
        error
      );
    }
  };

  return (
    <div className="overflow-y-auto overflow-x-visible h-full">
      <div className="flex flex-col gap-3 p-3 overflow-x-visible">
        {friends.map((friend, index) => {
          const username = friend.username || t("chat.defaultUsername");
          const bgColor = colors[index % colors.length];
          const hasUnread = unreadUserIds?.includes(String(friend.id));

          return (
            <div
              key={friend.id}
              className={`relative flex items-center justify-between p-3 rounded-2xl ${bgColor} shadow-md transition-all group`}
            >
              <div
                onClick={() => onFriendClick(friend)}
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
              >
                <FriendAvatar
                  friendId={friend.id}
                  username={username}
                />

                <div className="flex flex-col min-w-0">
                  <span className="text-white font-bold text-md truncate">
                    {username}
                  </span>
                </div>
              </div>

              <div className="relative shrink-0 mr-2">
                <button
                  onClick={() => onFriendClick(friend)}
                  className="bg-black/20 px-3 py-1.5 rounded-lg text-white balatro hover:outline-2 active:scale-90 text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
                >
                  {t("friendList.chat")}
                </button>

                {hasUnread && (
                  <div className="absolute bottom-1 right-1 z-20 pointer-events-none">
                    <NotificationSignal />
                  </div>
                )}
              </div>

              <DropdownMenu
                items={[
                  { label: t("friendList.block"), value: "block" },
                  { label: t("friendList.delete"), value: "delete" },
                ]}
                color="bg-black/20"
                className="h-full flex items-center"
                menuClassName="sm:w-44 sm:right-0"
                pos={index >= friends.length - 2 ? 1 : -1}
                isIconOnly={true}
                onChange={(value) =>
                  handleMenuAction(value, friend)
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}