import { useState } from "react";
import Heading from "../components/Heading";
import UploadBox from "../components/UploadBox";
import ChatInterface from "../components/ChatInterface";

export default function Home() {
  // Track how many files have been successfully uploaded
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleUploadSuccess = () => {
    setUploadedCount((prev) => prev + 1);
  };

  // Chat is unlocked once at least one file has been processed
  const chatReady = uploadedCount > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Heading />

      {/* Step indicator */}
      <div className="w-full max-w-4xl mx-auto px-4 flex items-center gap-3 text-sm font-medium">
        {/* Step 1 */}
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
            style={{
              background: "linear-gradient(135deg, #4285F4, #34A853)",
            }}
          >
            1
          </span>
          <span className="text-gray-600">Upload Documents</span>
        </div>

        {/* Connector */}
        <div className="flex-1 h-[2px] rounded animate-border" />

        {/* Step 2 */}
        <div className={`flex items-center gap-2 transition-opacity ${chatReady ? "opacity-100" : "opacity-40"}`}>
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
            style={{
              background: chatReady
                ? "linear-gradient(135deg, #34A853, #FBBC05)"
                : "#d1d5db",
            }}
          >
            2
          </span>
          <span className="text-gray-600">Ask Questions</span>
        </div>
      </div>

      {/* Upload section */}
      <UploadBox onUploadSuccess={handleUploadSuccess} />

      {/* Divider with label */}
      <div className="w-full max-w-4xl mx-auto px-4 mt-8 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
          Chat
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Chat section */}
      <ChatInterface ready={chatReady} />
    </div>
  );
}