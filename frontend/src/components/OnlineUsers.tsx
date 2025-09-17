interface Props {
  users: string[];
  currentUser: string;
}

export default function OnlineUsers({ users, currentUser }: Props) {
  return (
    <div>
      <h2 className="font-semibold mb-3">
        Online Users ({users.length})
      </h2>
      <ul className="space-y-1">
        {users.map((u, idx) => (
          <li
            key={idx}
            className={`flex items-center space-x-2 py-1 px-2 rounded ${
              u === currentUser ? "bg-blue-100 font-bold text-blue-600" : "hover:bg-gray-200"
            }`}
          >
            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
            <span>{u}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
