import { useEffect, useRef, useState } from "react";
import ChatWindow from "./components/ChatWindow";
import OnlineUsers from "./components/OnlineUsers";
import type { Message } from "./types";
import "./App.css";

function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [username, setUsername] = useState<string>("");
  const [inputName, setInputName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Connect WebSocket khi có username
  useEffect(() => {
    if (!username) return;

    const socket = new WebSocket(`ws://localhost:8080/ws?username=${username}`);

    socket.onopen = () => console.log("✅ Connected to server");

    socket.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);

      if (msg.type === "system") {
        setMessages((prev) => [...prev, msg]);
        if (msg.usersList) {
          setOnlineUsers(msg.usersList);
        }
      } else if (msg.type === "chat") {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.onclose = () => console.log("❌ Disconnected from server");
    socket.onerror = (err) => console.error("WS Error:", err);

    setWs(socket);
    return () => socket.close();
  }, [username]);

  const sendMessage = (content: string) => {
    if (ws && content.trim() !== "") {
      const msg: Message = {
        type: "chat",
        username,
        content,
        timestamp: Date.now(),
      };
      ws.send(JSON.stringify(msg));
    }
  };

  if (!username) {
    // Màn hình login
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white shadow-md p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Enter Username</h2>
          <input
            ref={inputRef}
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="border rounded p-2 w-full mb-3"
            placeholder="Your name..."
          />
          <button
            onClick={() => {
              if (inputName.trim() !== "") {
                setUsername(inputName.trim());
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="font-semibold mb-2">Online Users</h2>
        <OnlineUsers users={onlineUsers} currentUser={username}/>
      </div>
      <div className="flex-1 flex flex-col">
        <ChatWindow messages={messages} username={username} onSend={sendMessage} />
      </div>
    </div>
  );
}

export default App;
