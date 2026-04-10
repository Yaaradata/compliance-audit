"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Props {
  pipelineId: string;
  stage: number;
  onOutputUpdated: () => void;
}

export function StageChatPanel({ pipelineId, stage, onOutputUpdated }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);

  useEffect(() => {
    setLoading(true);
    api.get<ChatMessage[]>(`/compliance-pipeline/${pipelineId}/stage/${stage}/chat`)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [pipelineId, stage]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      // If user scrolls away from bottom, stop auto-jumping.
      shouldStickToBottomRef.current = distanceFromBottom <= 80;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (!shouldStickToBottomRef.current) return;

    // Scroll only the chat container, never the outer page.
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await api.post<{ reply: string; output_updated: boolean }>(
        `/compliance-pipeline/${pipelineId}/stage/${stage}/chat`,
        { content: text }
      );

      const assistantMsg: ChatMessage = {
        id: `resp-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (res.output_updated) {
        onOutputUpdated();
      }
    } catch {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Failed to get a response. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-l" style={{ borderColor: "var(--border)" }}>
      <div className="px-3 py-2.5 border-b font-semibold text-xs" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
        AI Assistant — Stage {stage}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--foreground-muted)" }}>Loading chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--foreground-muted)" }}>
            Ask questions or request changes to the stage output.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap
                  ${m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }
                `}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-2.5 flex gap-2" style={{ borderColor: "var(--border)" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask about or request changes..."
          className="flex-1 rounded-lg border px-2.5 py-1.5 text-xs"
          style={{ borderColor: "var(--border)" }}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="btn-primary px-3 py-1.5 text-xs rounded-lg disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
