import type { Friend } from "../types/chat";

interface FriendItemProps {
  friend: Friend;
  onClick?: (friend: Friend) => void;
}

export default function FriendItem({
  friend,
  onClick,
}: FriendItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(friend)}
      className="
        flex
        items-center
        bg-white/10
        w-full
        min-h-15
        p-1
        rounded-2xl
        transition-all
        duration-150
        hover:bg-white/20
        hover:outline-2
        hover:outline-white/40
        active:scale-[0.98]
        text-left
      "
    >
      {/* Photo */}

      <div
        className="
          bg-byellow
          h-13
          rounded-full
          aspect-square
          mr-2
          overflow-hidden
          shrink-0
        "
      >
        {friend.profilePic && (
          <img
            src={friend.profilePic}
            alt={friend.username}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Nom */}

      <p className="text-white text-xl font-bold truncate">
        {friend.username}
      </p>

      {/* Message non lu */}

      {friend.hasUnread && (
        <span
          className="
            ml-auto
            mr-2
            w-3
            h-3
            rounded-full
            bg-red-500
            shadow-md
            shadow-red-500/50
            shrink-0
          "
        />
      )}
    </button>
  );
}