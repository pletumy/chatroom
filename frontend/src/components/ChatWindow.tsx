import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import type { ChatMessage } from "../App";  // 👈 type-only import

interface Props {
  messages: ChatMessage[];
}

const ChatWindow = ({ messages }: Props) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      {messages.map((msg, index) => (
        <ChatBubble key={index} msg={msg} />
      ))}
      <div ref={bottomRef}></div>
    </div>
  );
};

export default ChatWindow;
