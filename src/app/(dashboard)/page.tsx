"use client";

import { Sidebar } from "@/components/sidebar/sidebar";
import { NewChatArea } from "@/components/chat/new-chat-area";

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <NewChatArea />
      </main>
    </div>
  );
}