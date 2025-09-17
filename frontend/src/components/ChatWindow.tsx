import { useState, useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import type { Message } from "../types";

interface Props {
  messages: Message[];
  username: string;
  onSend: (msg: string) => void;
}

export default function ChatWindow({ messages, username, onSend }: Props) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() !== "") {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {messages.map((msg, idx) =>
          msg.type === "system" ? (
            <div key={idx} className="text-center text-gray-500 italic text-sm my-2">
              {msg.content}
            </div>
          ) : (
            <ChatBubble
              key={idx}
              sender={msg.username || "unknown"}
              content={msg.content || ""}
              isMe={msg.username === username}
            />
          )
        )}
        <div ref={endRef} />
      </div>
      <div className="p-4 border-t flex">
        <input
          className="flex-1 border rounded p-2 mr-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
