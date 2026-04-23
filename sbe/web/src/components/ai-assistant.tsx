"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I am your Kinetic Ledger assistant. How can I help you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    const newChat = [...chat, { role: 'user' as const, content: userMessage }];
    setChat(newChat);
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newChat }),
      });

      if (!res.ok) throw new Error("Failed to get AI response");
      
      const data = await res.json();
      setChat(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChat(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my neural network. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100] lg:bottom-6">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <Bot className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold">
            1
          </div>
          <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/20" />
        </button>
      )}

      {isOpen && (
        <div className="glass-modal flex h-[500px] w-[350px] flex-col overflow-hidden border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-white/[0.03] px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">Kinetic Assistant</h3>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Live Support</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat area */}
          <div 
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto p-5 custom-scrollbar"
          >
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex max-w-[85%] flex-col gap-1.5",
                  msg.role === 'user' ? "ml-auto items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10" 
                    : "glass-light text-foreground border border-white/10 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground font-medium uppercase px-1">
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 px-1">
                <div className="flex h-8 w-12 items-center justify-center rounded-full glass-light border border-white/5">
                  <div className="flex gap-1">
                    <div className="h-1 w-1 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
                    <div className="h-1 w-1 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
                    <div className="h-1 w-1 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="w-full rounded-xl glass-input py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none border-none ring-0 focus:ring-1 focus:ring-primary/30"
              />
              <button
                onClick={handleSend}
                className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-lg transition-all hover:opacity-90 active:scale-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-[9px] text-center text-muted-foreground/60 font-medium uppercase tracking-tight">
              Powered by <span className="text-primary/70">Kinetic Intelligence Layer</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
