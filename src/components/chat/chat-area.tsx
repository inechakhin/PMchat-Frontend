"use client";

import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

interface ChatAreaProps {
  chatId?: string;
}

export function ChatArea({ chatId }: ChatAreaProps) {
  const hookChatId = chatId ?? null;
  const [chatType, setChatType] = useState<"communication" | "generation">("communication");
  const { messages, isLoading, isStreaming, sendMessage } = useChat(hookChatId);
  
  const handleSendMessage = (text: string) => {
    sendMessage(text, chatType);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950">
      <ChatHeader chatId={chatId} />
      <MessageList
        chatId={chatId ?? "new"}
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
        chatType={chatType}
        onChatTypeChange={setChatType}
      />
      <ChatInput
        chatId={chatId ?? "new"}
        onSendMessage={handleSendMessage}
        isStreaming={isStreaming}
      />
    </div>
  );
}