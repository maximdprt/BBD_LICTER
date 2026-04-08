"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { SephoraLogo } from "@/components/ui/SephoraLogo";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "Quel est le sentiment global de Sephora aujourd'hui ?",
  "Compare Sephora et Nocibé sur les dernières semaines",
  "Quels sont les thèmes les plus négatifs ?",
  "Donne-moi 3 actions prioritaires à lancer",
];

export function MistralChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
        });
        const data = (await res.json()) as { content?: string; error?: string };
        const aiMsg: Message = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.content ?? data.error ?? "Erreur inconnue",
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: "Erreur de connexion. Réessayez.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const reset = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed right-4 bottom-20 z-50 flex w-[420px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl shadow-2xl md:right-6 md:bottom-24"
            style={{
              height: "min(600px, calc(100vh - 140px))",
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex shrink-0 items-center justify-between px-5 py-4"
              style={{
                background: "linear-gradient(135deg, #000000, #1a1a1a)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <SephoraLogo size={28} className="text-[#C9A96E]" />
                  <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-black bg-emerald-400" />
                </div>
                <div className="text-sm font-semibold text-white">SEPHORA Intel AI</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={reset}
                  className="grid size-8 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  title="Nouvelle conversation"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              style={{ scrollBehavior: "smooth" }}
            >
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <SephoraLogo size={48} className="text-black" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      Bienvenue sur SEPHORA Intel AI
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Posez vos questions sur les données, le sentiment client, ou la concurrence.
                    </p>
                  </div>
                  <div className="grid w-full gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void sendMessage(s)}
                        className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 text-left text-xs text-gray-700 transition-all hover:border-[#C9A96E]/30 hover:bg-[#C9A96E]/5"
                      >
                        <Sparkles className="mb-1 inline size-3 text-[#C9A96E]" /> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="mr-2 mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-black">
                      <SephoraLogo size={14} className="text-[#C9A96E]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "border border-gray-100 bg-gray-50 text-gray-800"
                    }`}
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-black">
                    <SephoraLogo size={14} className="text-[#C9A96E]" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    <Loader2 className="size-4 animate-spin text-[#C9A96E]" />
                    Analyse en cours…
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-gray-100 px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question…"
                  rows={1}
                  className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#C9A96E]/50 focus:ring-1 focus:ring-[#C9A96E]/20"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => void sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-black text-white transition-all hover:bg-gray-800 disabled:opacity-30"
                >
                  <Send className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                SEPHORA Intel AI — Données en temps réel
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-4 bottom-4 z-50 grid size-14 place-items-center rounded-full shadow-lg transition-colors md:right-6 md:bottom-6"
        style={{
          background: open
            ? "linear-gradient(135deg, #1a1a1a, #000000)"
            : "linear-gradient(135deg, #000000, #1a1a1a)",
          border: "2px solid rgba(201,169,110,0.3)",
        }}
        title="SEPHORA Intel AI"
      >
        {open ? (
          <X className="size-5 text-white" />
        ) : (
          <SephoraLogo size={26} className="text-[#C9A96E]" />
        )}
      </motion.button>
    </>
  );
}
