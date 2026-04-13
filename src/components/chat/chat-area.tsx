"use client";

import { useChat } from "@/hooks/useChat";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

interface ChatAreaProps {
  chatId?: string;
}

export function ChatArea({ chatId }: ChatAreaProps) {
  const hookChatId = chatId ?? null;
  const { messages, isLoading, isStreaming, sendMessage } = useChat(hookChatId);
  
  const inputChatId = chatId ?? "new";

  return (
    <div className="flex-1 flex flex-col h-full">
      <MessageList
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
      />
      <ChatInput
        chatId={inputChatId}
        onSendMessage={sendMessage}
        isStreaming={isStreaming}
      />
    </div>
  );
}