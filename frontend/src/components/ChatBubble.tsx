import type { ChatMessage } from "../App";  // 👈 type-only import

interface Props {
  msg: ChatMessage;
}

const ChatBubble = ({ msg }: Props) => {
  const isMe = msg.user === "me";

  if (msg.type !== "chat") return null;

  return (
    <div className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-3 py-2 rounded-lg max-w-xs ${
          isMe ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        {!isMe && (
          <span className="block text-xs font-semibold text-gray-600 mb-1">
            {msg.user}
          </span>
        )}
        <span>{msg.text}</span>
      </div>
    </div>
  );
};

export default ChatBubble;
