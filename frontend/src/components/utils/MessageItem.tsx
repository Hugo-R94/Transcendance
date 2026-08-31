import type { Message } from "../../api/chat";
interface MessageItemProps {
  message: Message;
  isMine: boolean;
}

export default function MessageItem({
  message,
  isMine,
}: MessageItemProps) {
  return (
    <div
      className={`
        p-2
        rounded-xl
        max-w-[75%]
        text-sm
        break-words
        ${
          isMine
            ? `
              bg-gray-100
              text-gray-800
              self-start
              mr-auto
            `
            : `
              bg-blue-500
              text-white
              self-end
              ml-auto
            `
        }
      `}
    >
      {message.text}
    </div>
  );
}