"use client";

import { useEffect, useRef } from "react";
import { useMessageStore } from "@/store/message-store";
import { useShallow } from 'zustand/react/shallow';
import { ChatTypeSelector } from "./chat-type-selector";
import { MessageBubble } from "./message-bubble";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  chatId: string;
  chatType: "communication" | "generation";
  onChatTypeChange: (type: "communication" | "generation") => void;
}

export function MessageList({ chatId, chatType, onChatTypeChange }: MessageListProps) {
  const messages = useMessageStore(
    useShallow((state) => (chatId ? state.messagesByChatId[chatId] || [] : []))
  );
  const isLoading = useMessageStore(
    (state) => (chatId ? state.isLoadingMessages[chatId] : false)
  );
  const isStreaming = useMessageStore(
    (state) => (chatId ? state.isStreamingByChatId[chatId] : false)
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const prevMessagesLength = useRef(0);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return false;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  useEffect(() => {
    if (!bottomRef.current) return;

    const isNewMessage = messages.length > prevMessagesLength.current;

    if (isFirstRender.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto" });
      isFirstRender.current = false;
    } else if (isNewMessage || (isStreaming && isNearBottom())) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLength.current = messages.length;
  }, [messages]);

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
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Начните общение
        </h2>
        <ChatTypeSelector
          currentType={chatType}
          onTypeChange={onChatTypeChange}
        />
        <p className="text-gray-500 text-center max-w-sm">
          {chatType === "communication"
            ? "Задайте вопрос по существующей документации"
            : "Опишите задачу для генерации нового документа"}
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
          chatId={chatId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}