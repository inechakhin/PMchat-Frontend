"use client";

import { ChatPreview } from "@/types/types";
import { useRouter, usePathname } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { RenameChatDialog } from "./dialogs/rename-chat-dialog";
import { DeleteChatDialog } from "./dialogs/delete-chat-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatItemProps {
  chat: ChatPreview;
}

export function ChatItem({ chat }: ChatItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === `/chat/${chat.id}`;
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const truncatedTitle = chat.title.length > 20
    ? chat.title.slice(0, 20) + "..."
    : chat.title;

  return (
    <>
      <div
        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-gray-800" : "hover:bg-gray-800/50"
          }`}
        onClick={() => router.push(`/chat/${chat.id}`)}
      >
        <div className="flex-1 truncate text-sm" title={chat.title}>
          {truncatedTitle}
        </div>
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-700 transition"
            >
              <MoreHorizontal size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="end">
            <button
              onClick={() => {
                setMenuOpen(false);
                setRenameOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-800"
            >
              <Pencil size={14} /> Переименовать
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                setDeleteOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-red-900/50 text-red-400"
            >
              <Trash2 size={14} /> Удалить
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <RenameChatDialog
        chatId={chat.id}
        currentTitle={chat.title}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
      <DeleteChatDialog
        chatId={chat.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}