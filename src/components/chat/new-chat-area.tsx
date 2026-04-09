"use client";

import { useChat } from "@/hooks/useChat";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

export function NewChatArea() {
  const { messages, isLoading, isStreaming, sendMessage } = useChat(null);

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} isLoading={isLoading} isStreaming={isStreaming} />
      <ChatInput chatId="new" onSendMessage={sendMessage} isStreaming={isStreaming} />
    </div>
  );
}