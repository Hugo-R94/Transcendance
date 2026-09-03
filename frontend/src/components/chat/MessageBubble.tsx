import type { Message } from "../../api/chat";

import InviteGame from "./invitateGame";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  bubbleColor: string;
  username?: string;
}

export default function MessageBubble({
  message,
  isMine,
  bubbleColor,
  username,
}: MessageBubbleProps) {
  const isGameInvite =
    message.type === "game_invit";

  return (
    <div className={`
      flex flex-col
      min-w-0
      max-w-[calc(100%-48px)]
      ${isMine ? "items-end" : "items-start"}
    `}>
      {isGameInvite ? (
        <InviteGame
          color={bubbleColor}
          roomId={message.text}
          isMine={isMine}
          senderUsername={
            isMine ? undefined : username
          }
        />
      ) : (
        <div
          className={`p-3 rounded-2xl text-white ${bubbleColor} card
            max-w-full min-w-0 whitespace-pre-wrap break-words overflow-wrap-anywhere `}
          style={{
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
