"use client";

export function FileUploadZone({ onUpload, label, accept }: { onUpload?: () => void; label?: string; accept?: string }) {
  return (
    <div
      onClick={onUpload}
      className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50/50 cursor-pointer hover:bg-blue-50 transition-colors"
    >
      <div className="text-2xl mb-1">📎</div>
      <div className="text-sm font-semibold text-blue-800">{label || "Drop files here or click to upload"}</div>
      {accept && <div className="text-[11px] text-gray-500 mt-1">Accepted: {accept}</div>}
      <div className="text-[11px] text-gray-400 mt-1">AI will auto-classify and suggest control mappings</div>
    </div>
  );
}
