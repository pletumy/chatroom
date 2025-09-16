import { useEffect, useRef, useState } from "react";
import ChatWindow from "./components/ChatWindow";
import OnlineUsers from "./components/OnlineUsers";

const WS_URL = "ws://localhost:8080/ws"; // đổi theo BE

export interface ChatMessage {
  type: "chat" | "users";
  text?: string;
  user?: string;
  users?: string[];
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket server");
    };

    ws.current.onmessage = (event) => {
      const msg: ChatMessage = JSON.parse(event.data);

      if (msg.type === "chat") {
        setMessages((prev) => [...prev, msg]);
      } else if (msg.type === "users" && msg.users) {
        setOnlineUsers(msg.users);
      }
    };

    ws.current.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() !== "" && ws.current) {
      const msg: ChatMessage = {
        type: "chat",
        text: input,
        user: "me", // TODO: thay bằng username sau khi login
      };
      ws.current.send(JSON.stringify(msg));
      setInput("");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar user list */}
      <div className="w-1/4 bg-gray-100 border-r">
        <OnlineUsers users={onlineUsers} />
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow messages={messages} />
        <div className="p-4 flex border-t">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2 mr-2"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
