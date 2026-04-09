"use client";

import { useParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatArea } from "@/components/chat/chat-area";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <ChatArea chatId={chatId} />
        </main>
      </div>
    );
}