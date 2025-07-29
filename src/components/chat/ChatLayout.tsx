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
      
      const formattedMessages = messagesArray.map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "llm",   
        content: msg.message || ""                     
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
    
    // Add empty LLM message that we'll update as chunks arrive
    const llmMessageIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "llm" as const, content: "" }]);
    
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
      
      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No reader available');
      }
      
      let accumulatedContent = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulatedContent += data.chunk;
                // Update the LLM message with accumulated content
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[llmMessageIndex] = {
                    role: "llm",
                    content: accumulatedContent
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.warn('Failed to parse streaming data:', line);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove both user and empty LLM messages if sending failed
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = async (refreshThreads: () => void) => {
    try {
      const title = prompt("Enter thread title:");
      if (!title || title.trim() === "") return;

      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const threadId = data.thread_id || data.id || data.threadId;

      setSelectedThreadId(threadId);
      setMessages([]);

      refreshThreads(); 
    } catch (error) {
      console.error("Error creating new thread:", error);
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
        <div className="flex-1 overflow-auto space-y-2 flex flex-col items-center">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 w-3/4 ${
                msg.role === "user"
                  ? "bg-blue-100"
                  : msg.role === "llm"
                  ? "bg-gray-100"
                  : "bg-gray-50"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="text-sm text-gray-500 italic p-4 bg-gray-100 w-3/4">
              Thinking...
            </div>
          )}
        </div>

        {selectedThreadId && (
          <ChatInput onSend={handleSend} disabled={loading} />
        )}
      </div>
    </div>
  );  
}