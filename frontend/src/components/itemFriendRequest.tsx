import type { FriendRequest } from "../types/chat";

interface FriendRequestItemProps {
  request: FriendRequest;
  onAccept?: (request: FriendRequest) => void;
  onReject?: (request: FriendRequest) => void;
  onBlock?: (request: FriendRequest) => void;
}

export default function FriendRequestItem({
  request,
  onAccept,
  onReject,
  onBlock,
}: FriendRequestItemProps) {
  return (
    <div
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
        {request.profilePic && (
          <img
            src={request.profilePic}
            alt={request.username}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Nom */}

      <p
        className="
          text-white
          text-xl
          font-bold
          truncate
          min-w-0
        "
      >
        {request.username}
      </p>

      {/* Actions */}

      <div className="ml-auto flex gap-1 shrink-0">

        {/* Accepter */}

        <button
          type="button"
          title="Accepter"
          onClick={() => onAccept?.(request)}
          className="
            bg-bgreen
            w-8
            h-8
            rounded-xl
            font-bold
            text-white
            hover:outline-2
            hover:outline-white
            hover:scale-105
            active:scale-90
            transition-all
          "
        >
          ✓
        </button>

        {/* Refuser */}

        <button
          type="button"
          title="Refuser"
          onClick={() => onReject?.(request)}
          className="
            bg-bred
            w-8
            h-8
            rounded-xl
            font-bold
            text-white
            hover:outline-2
            hover:outline-white
            hover:scale-105
            active:scale-90
            transition-all
          "
        >
          ✕
        </button>

        {/* Bloquer */}

        <button
          type="button"
          title="Bloquer"
          onClick={() => onBlock?.(request)}
          className="
            bg-gray-700
            w-8
            h-8
            rounded-xl
            font-bold
            text-white
            hover:outline-2
            hover:outline-white
            hover:bg-black
            hover:scale-105
            active:scale-90
            transition-all
          "
        >
          🚫
        </button>

      </div>
    </div>
  );
}