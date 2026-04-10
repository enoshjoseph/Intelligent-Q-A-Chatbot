import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../api/chatApi";

function MessageBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shadow">
          AI
        </div>
      )}

      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "text-white rounded-br-sm"
            : "bg-white text-gray-700 border border-gray-100 rounded-bl-sm"
        }`}
        style={
          isUser
            ? {
                background:
                  "linear-gradient(135deg, #4285F4 0%, #34A853 100%)",
              }
            : {}
        }
      >
        {text}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold ml-2 mt-1 shadow">
          You
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm w-fit mb-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-blue-400 rounded-full inline-block animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatInterface({ ready }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! Upload your documents above, then ask me anything about them.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setLoading(true);

    try {
      const data = await askQuestion(query);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Sorry, I couldn't connect to the backend. Make sure it's running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full flex justify-center mt-8 mb-12 px-4">
      <div className="w-full max-w-4xl flex flex-col" style={{ minHeight: 0 }}>
        {/* Chat history */}
        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner px-4 py-5 overflow-y-auto mb-4" style={{ maxHeight: "420px" }}>
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} text={m.text} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div
          className="w-full p-[1.5px] rounded-xl animate-border shadow-md"
        >
          <div className="w-full flex items-center bg-white rounded-xl px-4 py-3 gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={
                ready
                  ? "Ask something about your documents..."
                  : "Upload files above to unlock the chat..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!ready || loading}
              className="flex-1 bg-transparent outline-none text-gray-700 resize-none text-sm placeholder-gray-400 disabled:cursor-not-allowed"
              style={{ maxHeight: "120px", overflowY: "auto" }}
            />

            <button
              onClick={handleSend}
              disabled={!ready || loading || !input.trim()}
              className="ml-2 px-5 py-2 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 80%, #EA4335 100%)",
                backgroundSize: "200% auto",
              }}
            >
              {loading ? "..." : "Send →"}
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-2">
          Press <kbd className="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-xs">Enter</kbd> to send &nbsp;·&nbsp; <kbd className="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-xs">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
