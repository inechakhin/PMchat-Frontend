"use client";

import { useChatStore } from "@/store/chat-store";
import { useShallow } from 'zustand/react/shallow';
import { ChatItem } from "./chat-item";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ChatList() {
  const router = useRouter();

  const chatIds = useChatStore(
    useShallow((state) => 
      state.chats
        .slice()
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .map(c => c.id)
    )
  );
  
  const isLoading = useChatStore((s) => s.isLoading);

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
      {chatIds.map((id) => (
        <ChatItem key={id} chatId={id} />
      ))}
    </div>
  );
}