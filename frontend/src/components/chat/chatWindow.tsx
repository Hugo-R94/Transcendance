import { useState } from "react";
import { Link } from "react-router-dom";
import type { Conversation, Message, Friend } from "../../api/chat";
import { useUserAvatar } from "../../api/getUserAvatar";
import NotificationSignal from "../utils/notificationSignal";
import InviteGame from "./invitateGame";

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string | null;
  ws: WebSocket | null;
  wsConnected: boolean;
  hasUnread: boolean;
  onClose: () => void;
  onFriendClick: (friend: Friend) => void;
}

export default function ChatWindow({
  conversation,
  currentUserId,
  ws,
  wsConnected,
  hasUnread,
  onClose,
  onFriendClick,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const effectiveUserId =
    currentUserId || localStorage.getItem("userID");

  const otherUser =
    String(conversation.user1_id) === String(effectiveUserId)
      ? conversation.user2
      : conversation.user1;

  const otherUserAvatar = useUserAvatar(
    otherUser?.id ? String(otherUser.id) : undefined
  );

  const myAvatar = useUserAvatar(
    effectiveUserId
      ? String(effectiveUserId)
      : undefined
  );

  const handleOpenChat = () => {
    if (!otherUser?.id) return;

    onFriendClick({
      id: otherUser.id,
      username: otherUser.username,
      profilePic: otherUser.profile_pic,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const text = newMessage.trim();

    if (
      !text ||
      !ws ||
      ws.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    ws.send(
      JSON.stringify({
        type: "message",
        conversation_id: conversation.id,
        text,
      })
    );

    setNewMessage("");
  };

  return (
    <div
      onClick={handleOpenChat}
      className={`bg-bdarkgreen rounded-2xl shadow-lg shadow-black overflow-hidden flex flex-col transition-all duration-300 ease-in-out origin-bottom-right ${
        isMinimized
          ? "w-48 h-11 scale-95 opacity-90 translate-y-1 cursor-pointer p-1 justify-center"
          : "w-80 h-[30rem] scale-100 opacity-100 translate-y-0 p-3"
      }`}
    >
      {isMinimized ? (
        <div className="w-full h-full flex flex-row items-center justify-between text-white px-2">
          <div className="flex items-center gap-2 min-w-0">
            {otherUser?.id && (
              <div className="w-6 h-6 rounded-full bg-byellow overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                {otherUserAvatar ? (
                  <img
                    src={otherUserAvatar}
                    alt={otherUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {otherUser?.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
            )}

            <span className="font-bold text-xs tracking-wider truncate max-w-[90px]">
              {otherUser?.username || "Chat"}
            </span>

            {hasUnread && <NotificationSignal />}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="text-xs transform transition-transform duration-500 rotate-180"
          >
            ▼
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col p-3 bg-bdarkgreen rounded-2xl min-w-0">
          <div className="flex items-center gap-2 h-15 px-2 bg-white/10 shrink-0 rounded-xl min-w-0">
            {otherUser?.id && (
              <Link
                to={`/profil/${otherUser.id}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-byellow w-10 h-10 rounded-full balatro font-bold overflow-visible shrink-0 hover:outline-2 hover:outline-white transition-all flex items-center justify-center text-white"
              >
                {otherUserAvatar ? (
                  <img
                    src={otherUserAvatar}
                    alt={otherUser.username}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>
                    {otherUser?.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </Link>
            )}

            {hasUnread && (
              <div className="shrink-0 flex items-center justify-center">
                <NotificationSignal />
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <Link
                to={`/profil/${otherUser?.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-white font-bold truncate hover:underline"
              >
                {otherUser?.username || "Utilisateur"}
              </Link>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="bg-byellow w-8 h-8 rounded-xl balatro font-bold text-white flex items-center justify-center hover:outline-2 hover:outline-white active:scale-90 transition-all shrink-0"
            >
              <span className="transform transition-transform duration-500">
                ▼
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="bg-byellow flex justify-center items-center w-8 h-8 text-white balatro rounded-xl font-bold hover:outline-2 hover:outline-white active:scale-90 transition-all shrink-0"
            >
              <span className="balatro text-xl leading-none text-3xl -translate-y-[2px]">
                ×
              </span>
            </button>
          </div>

          <div className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden p-2 flex flex-col-reverse gap-3 my-2 w-full">
            {conversation.messages?.length > 0 ? (
              conversation.messages.map((msg: Message) => {
                const isMine =
                  String(msg.sender_id) ===
                  String(effectiveUserId);

                const messageAvatar = isMine
                  ? myAvatar
                  : otherUserAvatar;

                const bubbleColor = isMine
                  ? "bg-bred"
                  : "bg-bblue";

                const profileTarget = isMine
                  ? effectiveUserId
                    ? `/profil/${effectiveUserId}`
                    : "#"
                  : otherUser?.id
                    ? `/profil/${otherUser.id}`
                    : "#";

                const isGameInvite = msg.type === "game_invit";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 w-full min-w-0 ${
                      isMine
                        ? "flex-row-reverse"
                        : "flex-row"
                    } justify-end`}
                  >
                    <div
                      className={`flex flex-col min-w-0 max-w-[calc(100%-48px)] ${
                        isMine
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      {isGameInvite ? (
                        <InviteGame
						  color={bubbleColor}
                          roomId={msg.text}
                          isMine={isMine}
                          senderUsername={
                            isMine
                              ? undefined
                              : otherUser?.username
                          }
                        />
                      ) : (
                        <div
                          className={`p-3 rounded-2xl text-white ${bubbleColor} card max-w-full min-w-0 whitespace-pre-wrap break-words overflow-wrap-anywhere`}
                          style={{
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.text}
                        </div>
                      )}
                    </div>

                    <Link
                      to={profileTarget}
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full balatro bg-byellow overflow-hidden shrink-0 mb-1 hover:outline-2 hover:outline-white transition-all flex items-center justify-center font-bold text-white text-xs"
                    >
                      {messageAvatar ? (
                        <img
                          src={messageAvatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {isMine
                            ? "M"
                            : otherUser?.username
                                ?.charAt(0)
                                .toUpperCase()}
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full text-white/50 text-sm">
                Aucun message
              </div>
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            onClick={(e) => e.stopPropagation()}
            className="flex gap-1 p-2 bg-white/10 shrink-0 rounded-2xl"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) =>
                setNewMessage(e.target.value)
              }
              placeholder="Message..."
              disabled={!wsConnected}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white text-black outline-none disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!wsConnected}
              className="bg-bblue px-3 rounded-xl font-bold text-white hover:outline-2 hover:outline-white active:scale-90 disabled:opacity-50 transition-all shrink-0"
            >
              →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}