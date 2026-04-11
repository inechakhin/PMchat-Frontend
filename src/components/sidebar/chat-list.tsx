"use client";

import { useChats } from "@/hooks/useChats";
import { ChatItem } from "./chat-item";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      <Button
        variant="primary"
        size="sm"
        className="w-full justify-start gap-2 px-3 py-2"
        onClick={handleNewChat}
      >
        <Plus size={16} />
        <span>Новый чат</span>
      </Button>
      {chats.map((chat) => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}