interface Props {
  users: string[];
}

const OnlineUsers = ({ users }: Props) => {
  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">Online Users</h2>
      <ul>
        {users.map((u, i) => (
          <li key={i} className="mb-2 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            {u}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsers;
