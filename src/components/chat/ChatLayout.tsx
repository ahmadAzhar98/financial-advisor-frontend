import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatInput from "./ChatInput";

export default function ChatLayout() {
  const [messages, setMessages] = useState<
    { role: "user" | "llm"; content: string }[]
  >([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchChat = async (threadId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/chat/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Fetched chat data:', data); // Debug log
      
      // Handle different possible response formats
      let messagesArray = [];
      if (Array.isArray(data)) {
        messagesArray = data;
      } else if (data.messages && Array.isArray(data.messages)) {
        messagesArray = data.messages;
      } else if (data.conversation && Array.isArray(data.conversation)) {
        messagesArray = data.conversation;
      } else {
        console.warn('Unexpected data format:', data);
        messagesArray = [];
      }
      
      // Ensure each message has the correct structure and proper role mapping
      const formattedMessages = messagesArray.map((msg: any) => ({
        role: (msg.role === "user" || msg.sender === "user" || msg.type === "user") ? "user" : "llm",
        content: msg.content || msg.message || msg.text || ""
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching chat:', error);
      setMessages([]); // Reset to empty on error
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (text: string) => {
    if (!selectedThreadId) return;
    
    // Add user message immediately
    const userMessage = { role: "user" as const, content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/chat/${selectedThreadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Send response:', data); // Debug log
      
      // Handle different possible response formats
      const responseContent = data.response || data.message || data.content || "No response";
      const llmMessage = { role: "llm" as const, content: responseContent };
      
      setMessages((prev) => [...prev, llmMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the user message if sending failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "New Chat" }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('New thread response:', data); // Debug log
      
      const threadId = data.thread_id || data.id || data.threadId;
      setSelectedThreadId(threadId);
      setMessages([]);
    } catch (error) {
      console.error('Error creating new thread:', error);
    }
  };

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    fetchChat(id);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        onNewThread={handleNewThread}
        onSelectThread={handleSelectThread}
        selectedThreadId={selectedThreadId}
      />
      <div className="flex flex-col flex-1 p-4">
        <div className="flex-1 overflow-auto space-y-2 flex flex-col">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 max-w-md rounded-lg ${
                msg.role === "user" 
                  ? "bg-blue-100 self-end" 
                  : "bg-gray-100 self-start"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="text-sm text-gray-500 italic">Thinking...</div>
          )}
        </div>
        {selectedThreadId && (
          <ChatInput onSend={handleSend} disabled={loading} />
        )}
      </div>
    </div>
  );
}