"use client";

import { ChatPreview } from "@/types/types";
import { useRouter, usePathname } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { RenameChatDialog } from "./dialogs/rename-chat-dialog";
import { DeleteChatDialog } from "./dialogs/delete-chat-dialog";
import { Button } from "@/components/ui/button";
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
        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-gray-700" : "hover:bg-gray-700/50"
          }`}
        onClick={() => router.push(`/chat/${chat.id}`)}
      >
        <div className="flex-1 truncate text-sm" title={chat.title}>
          {truncatedTitle}
        </div>
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => e.stopPropagation()}
            >
               <MoreHorizontal size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-38 p-1" align="end">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 px-2"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                setRenameOpen(true);
              }}
            >
              <Pencil size={14} /> Переименовать
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="w-full justify-start gap-2 px-2"
              onClick={() => {
                setMenuOpen(false);
                setDeleteOpen(true);
              }}>
              <Trash2 size={14} /> Удалить
            </Button>
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