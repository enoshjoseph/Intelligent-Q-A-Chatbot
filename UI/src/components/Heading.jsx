import { useEffect, useState } from "react";

export default function Heading() {
  const words = ["PDFs", "Images", "Videos"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white text-center pt-14 pb-8 px-4">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6 text-sm text-blue-600 font-medium shadow-sm">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />
        Powered by Gemini · RAG · ChromaDB
      </div>

      {/* Main Heading */}
      <h1
        className="text-5xl md:text-6xl font-bold leading-[1.3] text-transparent bg-clip-text animate-gradient animate-heading"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)",
          backgroundSize: "200% auto",
        }}
      >
        Intelligent Q &amp; A Chatbot
      </h1>

      {/* Animated Subheading */}
      <p className="mt-5 text-xl flex justify-center items-center gap-2 animate-subheading">
        <span className="text-blue-600 font-medium">Chat with your</span>

        <span className="relative h-7 w-[100px] overflow-hidden">
          <span
            key={index}
            className="absolute left-0 w-full text-center font-semibold text-transparent bg-clip-text animate-slide"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)",
            }}
          >
            {words[index]}
          </span>
        </span>
      </p>

      {/* Divider */}
      <div className="mt-8 mx-auto max-w-xs h-[1.5px] rounded-full animate-border" style={{ opacity: 0.6 }} />
    </div>
  );
}