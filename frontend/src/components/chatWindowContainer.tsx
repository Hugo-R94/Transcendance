import ChatWindow from "./chatWindow";
import type { Conversation } from "../../api/chat";

interface ChatWindowContainerProps {
  openConvIds: string[];
  convs: Conversation[];
  currentUserId: string | null;
  ws: WebSocket | null;
  wsConnected: boolean;
  onCloseConv: (convId: string) => void;
}

export function ChatWindowContainer({
  openConvIds,
  convs,
  currentUserId,
  ws,
  wsConnected,
  onCloseConv,
}: ChatWindowContainerProps) {
  const activeConversations = openConvIds
    .map((id) => convs.find((c) => String(c.id) === String(id)))
    .filter((c): c is Conversation => c !== undefined);

  if (activeConversations.length === 0) return null;

  return (
    <>
      {activeConversations.map((conv) => (
        <ChatWindow
          key={conv.id}
          conversation={conv}
          currentUserId={currentUserId}
          ws={ws}
          wsConnected={wsConnected}
          onClose={() => onCloseConv(String(conv.id))}
        />
      ))}
    </>
  );
}