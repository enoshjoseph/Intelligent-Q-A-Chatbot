import { useState, useRef, useCallback } from "react";
import { uploadFile } from "../api/chatApi";

const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "image/jpeg": "Image",
  "image/png": "Image",
  "image/gif": "Image",
  "image/webp": "Image",
  "video/mp4": "Video",
  "video/quicktime": "Video",
  "video/x-msvideo": "Video",
};

function FileTag({ file, status, progress, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  const isVideo = file.type.startsWith("video/");

  const icon = isPdf ? "📄" : isVideo ? "🎬" : isImage ? "🖼️" : "📁";

  const statusColor =
    status === "done"
      ? "text-green-600"
      : status === "error"
      ? "text-red-500"
      : "text-blue-500";

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-sm">
      <span className="text-lg">{icon}</span>
      <span className="flex-1 truncate max-w-[140px] text-gray-700 font-medium">
        {file.name}
      </span>

      {status === "uploading" && (
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)",
              backgroundSize: "200% auto",
            }}
          />
        </div>
      )}

      {status === "done" && (
        <span className={`${statusColor} font-semibold`}>✓</span>
      )}
      {status === "error" && (
        <span className={`${statusColor} font-semibold`}>✗</span>
      )}

      <button
        onClick={() => onRemove(file.name)}
        className="text-gray-400 hover:text-red-400 transition ml-1 text-base leading-none"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}

export default function UploadBox({ onUploadSuccess }) {
  const [files, setFiles] = useState([]); // [{file, status, progress}]
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const processFiles = useCallback(
    async (newFiles) => {
      const validFiles = newFiles.filter((f) => ACCEPTED_TYPES[f.type]);

      if (validFiles.length === 0) return;

      // Add them with "pending" status
      const entries = validFiles.map((file) => ({
        file,
        status: "uploading",
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...entries]);

      // Upload concurrently
      for (const entry of entries) {
        const { file } = entry;

        try {
          await uploadFile(file, (pct) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.file.name === file.name ? { ...f, progress: pct } : f
              )
            );
          });

          setFiles((prev) =>
            prev.map((f) =>
              f.file.name === file.name
                ? { ...f, status: "done", progress: 100 }
                : f
            )
          );

          if (onUploadSuccess) onUploadSuccess(file.name);
        } catch {
          setFiles((prev) =>
            prev.map((f) =>
              f.file.name === file.name ? { ...f, status: "error" } : f
            )
          );
        }
      }
    },
    [onUploadSuccess]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    processFiles(dropped);
  };

  const handleFileChange = (e) => {
    processFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleRemove = (name) => {
    setFiles((prev) => prev.filter((f) => f.file.name !== name));
  };

  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  return (
    <div className="w-full flex flex-col items-center gap-4 mt-8 px-4">
      {/* Drop Zone */}
      <div
        className={`w-full max-w-2xl relative rounded-2xl cursor-pointer transition-all duration-300 ${
          dragging ? "scale-[1.01]" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        {/* Animated border wrapper */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none animate-border"
          style={{ padding: "1.5px" }}
        >
          <div className="w-full h-full rounded-2xl bg-white" />
        </div>

        {/* Inner content */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center py-10 px-6 rounded-2xl border-2 border-dashed transition-colors ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : "border-blue-300 bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="text-5xl mb-3 select-none">
            {dragging ? "📂" : "☁️"}
          </div>

          <p className="text-gray-700 font-semibold text-base">
            {dragging
              ? "Drop files here"
              : "Click to upload or drag & drop files"}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Supported: PDF · Images (JPG, PNG, GIF, WebP) · Videos (MP4, MOV, AVI)
          </p>

          {allDone && (
            <p className="mt-3 text-sm font-medium text-green-600">
              ✅ All files processed! You can now ask questions below.
            </p>
          )}
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="w-full max-w-2xl flex flex-wrap gap-2">
          {files.map(({ file, status, progress }) => (
            <FileTag
              key={file.name}
              file={file}
              status={status}
              progress={progress}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}