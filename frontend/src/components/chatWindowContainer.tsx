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
}

export function ChatWindowContainer({
  openConvIds,
  convs,
  currentUserId,
  ws,
  wsConnected,
  onCloseConv,
  unreadUserIds,
  onFriendClick,
}: ChatWindowContainerProps) {
  const activeConversations = openConvIds
    .map((id) =>
      convs.find((c) => String(c.id) === String(id))
    )
    .filter(
      (c): c is Conversation => c !== undefined
    );

  if (activeConversations.length === 0) return null;

  return (
    <>
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
            conversation={conv}
            currentUserId={currentUserId}
            ws={ws}
            wsConnected={wsConnected}
            hasUnread={hasUnread}
            onClose={() => onCloseConv(String(conv.id))}
            onFriendClick={onFriendClick}
          />
        );
      })}
    </>
  );
}