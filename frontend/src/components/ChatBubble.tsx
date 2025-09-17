interface Props {
  sender: string;
  content: string;
  isMe: boolean;
}

export default function ChatBubble({ sender, content, isMe }: Props) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`px-3 py-2 rounded-lg max-w-xs ${
          isMe ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        {!isMe && <div className="text-xs font-semibold">{sender}</div>}
        <div>{content}</div>
      </div>
    </div>
  );
}
