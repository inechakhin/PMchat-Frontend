"use client";

import { useChats } from "@/hooks/useChats";
import { ChatItem } from "./chat-item";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChatList() {
  const { chats, isLoading } = useChats();
  const router = useRouter();

  const handleNewChat = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      <button
        onClick={handleNewChat}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 text-gray-300 transition-colors"
      >
        <Plus size={16} />
        <span>Новый чат</span>
      </button>
      {chats.map((chat) => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}