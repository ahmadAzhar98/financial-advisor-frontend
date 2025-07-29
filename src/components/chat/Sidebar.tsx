import { useEffect, useState } from "react";

export default function Sidebar({
  onNewThread,
  onSelectThread,
  selectedThreadId,
}: {
  onNewThread: (refreshThreads: () => void) => void; // updated to accept callback
  onSelectThread: (id: string) => void;
  selectedThreadId: string | null;
}) {
  const [threads, setThreads] = useState<{ id: string; title: string }[]>([]);

  const fetchThreads = async () => {
    const token = localStorage.getItem("access_token");
    const res = await fetch("/api/threads", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setThreads(data);
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-4 flex flex-col justify-between h-full">
      <div>
        <h2 className="text-lg font-bold mb-4">Threads</h2>
        <div className="space-y-2">
          <div
            className="cursor-pointer hover:bg-gray-700 p-2 rounded"
            onClick={() => onNewThread(fetchThreads)} // pass refresh callback
          >
            + New Chat
          </div>
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`cursor-pointer p-2 rounded ${
                selectedThreadId === thread.id ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
              onClick={() => onSelectThread(thread.id)}
            >
              {thread.title}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded mt-4"
      >
        Logout
      </button>
    </div>
  );
}
