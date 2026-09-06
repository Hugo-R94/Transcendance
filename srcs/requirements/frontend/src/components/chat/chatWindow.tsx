import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Conversation, Message, Friend } from "../../api/chat";
import { useUserAvatar } from "../../api/getUserAvatar";
import ChatHeader from "./chatWindowHeader";
import MinimizedHeader from "./MinimizedHeader";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string | null;
  ws: WebSocket | null;
  wsConnected: boolean;
  hasUnread: boolean;
  onClose: () => void;
  onFriendClick: (friend: Friend) => void;
  setReadConversations: (conversationId: string) => void;
  isTyping: boolean;
  isMobile: boolean;
  sendIsTyping: (conversationId: string) => void;
  isRead: boolean;
}

export default function ChatWindow({
  conversation,
  currentUserId,
  ws,
  wsConnected,
  hasUnread,
  onClose,
  onFriendClick,
  setReadConversations,
  isTyping,
  isMobile,
  sendIsTyping,
  isRead,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const typingIntervalRef = useRef<number | null>(null);

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
    effectiveUserId ? String(effectiveUserId) : undefined
  );
  
  //empeche de multiplier les actions.
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOpenChat = () => {
    if (!otherUser?.id) return;

    onFriendClick({
      id: otherUser.id,
      username: otherUser.username,
      profilePic: otherUser.profile_pic,
    });
  };

  //send message function
  const handleSendMessage = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const text = newMessage.trim();

    if (!text || !ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.send(
      JSON.stringify({
        type: "message",
        conversation_id: conversation.id,
        text,
      })
    );

    setReadConversations(conversation.id);
    setNewMessage("");
  };

  //verify input change for istyping
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const text = e.target.value;

    setNewMessage(text);

    if (!text.trim() || typingIntervalRef.current !== null) {
      return;
    }

    sendIsTyping(conversation.id);

    typingIntervalRef.current = window.setTimeout(() => {
      typingIntervalRef.current = null;
    }, 2000);
  };

  const getMessageAvatar = (isMine: boolean) => {
    return isMine ? myAvatar : otherUserAvatar;
  };

  const getProfileTarget = (isMine: boolean) => {
    if (isMine) {
      return effectiveUserId
        ? `/profil/${effectiveUserId}`
        : "#";
    }

    return otherUser?.id
      ? `/profil/${otherUser.id}`
      : "#";
  };

  return (
    <div
      onClick={handleOpenChat}
      className={`
        bg-bdarkgreen rounded-2xl shadow-lg shadow-black
        overflow-hidden flex flex-col
        transition-all duration-300 ease-in-out
        origin-bottom-right

        ${
          isMobile
            ? "w-full h-full p-3"
            : isMinimized
              ? "w-48 h-11 scale-95 opacity-90 translate-y-1 cursor-pointer p-1 justify-center"
              : "w-80 h-[30rem] scale-100 opacity-100 translate-y-0 p-3"
        }
      `}
    >
      {isMinimized ? (
        <MinimizedHeader
          username={otherUser?.username}
          avatar={otherUserAvatar}
          hasUnread={hasUnread}
          onRestore={() => setIsMinimized(false)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col
          p-3 bg-bdarkgreen rounded-2xl min-w-0">
          <ChatHeader
            otherUser={otherUser}
            otherUserAvatar={otherUserAvatar}
            hasUnread={hasUnread}
            onMinimize={() => setIsMinimized(true)}
            onClose={onClose}
            stopPropagation={stopPropagation}
          />

          {/* Messages */}
          <div className="
            flex-1 min-w-0 min-h-0
            overflow-y-auto overflow-x-hidden
            p-2 flex flex-col-reverse gap-3
            my-2 w-full
          ">
            {conversation.messages?.length > 0 ? (
              conversation.messages
                .filter(
                  (msg: Message) =>
                    msg.type !== "is_typing" &&
                    msg.type !== "read"
                )
                .map((msg: Message) => {
                  const isMine =
                    String(msg.sender_id) ===
                    String(effectiveUserId);

                  const avatar =
                    getMessageAvatar(isMine);

                  const profileTarget =
                    getProfileTarget(isMine);

                  const bubbleColor = isMine
                    ? "bg-bred"
                    : "bg-bblue";

                  return (
                    <div
                      key={msg.id}
                      className={`
                        flex items-end gap-2
                        w-full min-w-0
                        ${
                          isMine
                            ? "flex-row-reverse"
                            : "flex-row"
                        }
                        justify-end
                      `}
                    >
                      <MessageBubble
                        message={msg}
                        isMine={isMine}
                        bubbleColor={bubbleColor}
                        username={otherUser?.username}
                      />

                      <a
                        href={profileTarget}
                        onClick={stopPropagation}
                        className="
                          w-10 h-10 rounded-full balatro
                          bg-byellow overflow-hidden shrink-0 mb-1
                          hover:outline-2 hover:outline-white
                          transition-all flex items-center justify-center
                          font-bold text-white text-xs">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt="Avatar"
                            className="
                              w-full h-full
                              object-cover rounded-full
                            "
                          />
                        ) : (
                          <span>
                            {isMine
                              ? t("chatWindow.myInitial")
                              : otherUser?.username
                                  ?.charAt(0)
                                  .toUpperCase()}
                          </span>
                        )}
                      </a>
                    </div>
                  );
                })
            ) : (
              <div className="
                flex items-center justify-center
                h-full text-white/50 text-sm
              ">
                {t("chatWindow.emptyMessages")}
              </div>
            )}
          </div>

          {/* Status */}
          {isTyping && (
            <div className="
              text-white/60 text-xs px-3 pb-1
            ">
              {t("chatWindow.typing")}
            </div>
          )}

          {isRead &&
            String(
              conversation.messages?.[0]?.sender_id
            ) === String(effectiveUserId) && (
              <span className="text-xs text-white/60">
                {t("chatWindow.read")}
              </span>
            )}

          {/* Input */}
          <form
		    name="msg_form"
            onSubmit={handleSendMessage}
            onClick={stopPropagation}
            className="
              flex gap-1 p-2 bg-white/10
              shrink-0 rounded-2xl
            "
          >
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder={t("chatWindow.messagePlaceholder")}
              disabled={!wsConnected}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white text-black
                outline-none disabled:opacity-50"/>

            <button
              type="submit"
              disabled={!wsConnected}
              className="
                bg-bblue px-3 rounded-xl font-bold text-white
                hover:outline-2 hover:outline-white active:scale-90
                disabled:opacity-50 transition-all shrink-0">
					→
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
