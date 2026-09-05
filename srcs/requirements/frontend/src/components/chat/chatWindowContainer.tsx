import ChatWindow from "./chatWindow";
import type { Conversation, Friend } from "../../api/chat";

interface ChatWindowContainerProps {
  openConvIds: string[];
  convs: Conversation[];
  currentUserId: string | null;
  ws: WebSocket | null;
  wsConnected: boolean;
  onCloseConv: (convId: string) => void;
  unreadUserIds: string[];
  onFriendClick: (friend: Friend) => void;
  sendIsTyping: (conversationId: string) => void;
  setReadConversations: (ConversationId: string) => void;
  typingConversations: string[];
  readConversations: string[];
}

export function ChatWindowContainer({
  openConvIds,
  convs,
  currentUserId,
  sendIsTyping,
  setReadConversations,
  ws,
  typingConversations,
  wsConnected,
  onCloseConv,
  unreadUserIds,
  readConversations,
  onFriendClick,
}: ChatWindowContainerProps) {

  const activeConversations = openConvIds
    .map((id) =>
      convs.find((c) => String(c.id) === String(id))
    )
    .filter(
      (c): c is Conversation => c !== undefined
    );

  if (activeConversations.length === 0) {
    return null;
  }

  return (
    <>
      {/* DESKTOP : comportement actuel */}
      <div className="hidden md:flex items-end gap-3">
        {activeConversations.map((conv) => {
          const myId = String(currentUserId);

          const otherUser =
            String(conv.user1_id) === myId
              ? conv.user2
              : conv.user1;

          const hasUnread = unreadUserIds?.includes(
            String(otherUser?.id)
          );

          return (
            <ChatWindow
              key={conv.id}
              isRead={readConversations.includes(String(conv.id))}
              setReadConversations={setReadConversations}
              isMobile={false}
              isTyping={typingConversations.includes(
                String(conv.id)
              )}
              conversation={conv}
              currentUserId={currentUserId}
              sendIsTyping={sendIsTyping}
              ws={ws}
              wsConnected={wsConnected}
              hasUnread={hasUnread}
              onClose={() =>
                onCloseConv(String(conv.id))
              }
              onFriendClick={onFriendClick}
            />
          );
        })}
      </div>

      {/* MOBILE : UNE SEULE CONVERSATION */}
      <div className="md:hidden fixed inset-x-0 top-20 bottom-0 z-50 px-2">
        {activeConversations[0] && (() => {
          const conv = activeConversations[0];

          const myId = String(currentUserId);

          const otherUser =
            String(conv.user1_id) === myId
              ? conv.user2
              : conv.user1;

          const hasUnread = unreadUserIds?.includes(
            String(otherUser?.id)
          );

          return (
            <ChatWindow
              setReadConversations={setReadConversations}
              isMobile={true}
              isRead={readConversations.includes(String(conv.id))}
              isTyping={typingConversations.includes(
                String(conv.id)
              )}
              conversation={conv}
              currentUserId={currentUserId}
              sendIsTyping={sendIsTyping}
              ws={ws}
              wsConnected={wsConnected}
              hasUnread={hasUnread}
              onClose={() =>
                onCloseConv(String(conv.id))
              }
              onFriendClick={onFriendClick}
            />
          );
        })()}
      </div>
    </>
  );
}
