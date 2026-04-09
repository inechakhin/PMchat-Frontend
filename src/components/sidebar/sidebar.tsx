"use client";

import { useEffect } from "react";
import { ChatList } from "./chat-list";
import { UserProfile } from "./user-profile";
import { useChats } from "@/hooks/useChats";

export function Sidebar() {
  const { refetch } = useChats();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <aside className="w-64 flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex-1 overflow-y-auto">
        <ChatList />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <UserProfile />
      </div>
    </aside>
  );
}