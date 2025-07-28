import Sidebar from "./Sidebar";
import ChatInput from "./ChatInput";
import { useState } from "react";

export default function ChatLayout() {
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = (text: string) => {
    setMessages(prev => [...prev, text]);
  };

  return (
    <div className="flex h-full">
      <Sidebar />

      <div className="flex flex-col flex-1 p-4">
        <div className="flex-1 overflow-auto space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className="bg-gray-100 rounded-lg p-2 max-w-md self-end"
            >
              {msg}
            </div>
          ))}
        </div>

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
