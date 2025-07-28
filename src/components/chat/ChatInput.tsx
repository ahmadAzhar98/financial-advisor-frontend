import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1"
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <Button onClick={handleSubmit}>Send</Button>
    </div>
  );
}
