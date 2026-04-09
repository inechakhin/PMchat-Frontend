"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/types";
import { MessageBubble } from "./message-bubble";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
}

export function MessageList({ messages, isLoading, isStreaming }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold text-gray-300 mb-2">
          Начните общение
        </h2>
        <p className="text-gray-500 text-center">
          Задайте вопрос или опишите задачу, и я постараюсь помочь
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isStreaming={
            isStreaming &&
            index === messages.length - 1 &&
            msg.sender_type === "assistant"
          }
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}