/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, X, Send, Sparkles, MessageCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Kinetic AI assistant. I can help you with match analysis, betting strategies, or account questions. How can I help you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I've analyzed the current market conditions. The liquidity looks strong in the main win/draw/loss markets. Would you like me to show you the deep liquidity pools for the current top events?" 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group",
          isOpen ? "bg-[#1c1c1e] border border-white/10" : "bg-[#0071e3] shadow-[#0071e3]/20"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Bot className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff375f] rounded-full border-2 border-[#0071e3] animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "absolute bottom-20 right-0 w-[380px] h-[520px] rounded-3xl glass shadow-2xl transition-all duration-500 origin-bottom-right overflow-hidden flex flex-col border border-white/10",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3] flex items-center justify-center shadow-lg shadow-[#0071e3]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Kinetic AI</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
                <span className="text-[10px] font-medium text-[#86868b] uppercase tracking-wider">Operational</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[#86868b] hover:text-white transition-colors p-1 rounded-full hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === "user" ? "ml-auto items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-[#0071e3] text-white rounded-tr-none" 
                    : "bg-white/5 text-[#f5f5f7] border border-white/5 rounded-tl-none"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#86868b] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#86868b] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#86868b] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Input */}
        <div className="p-4 bg-white/[0.01] border-t border-white/5">
          <div className="relative group">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full h-11 bg-white/5 border border-white/10 rounded-2xl pl-4 pr-12 text-[13px] text-white placeholder:text-[#86868b] focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#0071e3] flex items-center justify-center text-white disabled:opacity-50 disabled:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[#86868b] font-medium uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-[#0071e3]" />
            <span>Powered by Kinetic Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
