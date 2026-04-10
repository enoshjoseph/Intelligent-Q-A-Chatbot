import { useState } from "react";

export default function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    console.log(message);
    setMessage("");
  };

  return (
    <div className="w-full flex justify-center mt-10">

  {/* Wrapper with width control */}
  <div className="w-full max-w-4xl p-[1px] rounded-xl animate-border">
    
    {/* Input Box */}
    <div className="w-full flex items-center bg-gray-100 rounded-xl px-4 py-3">
      
      <input
        type="text"
        placeholder="Ask something..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-transparent outline-none text-gray-700"
      />

      <button
  onClick={handleSend}
  className="ml-2 px-4 py-2 rounded-md text-white text-sm font-medium animate-border"
  style={{
    backgroundSize: "200% auto"
  }}
>
  Send
</button>

    </div>

  </div>

</div>
  );
}