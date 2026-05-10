"use client";

import { useEffect, useRef, useState } from "react";
import { useChats } from "@/hooks/useChats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RenameChatDialogProps {
  chatId: string;
  currentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameChatDialog({
  chatId,
  currentTitle,
  open,
  onOpenChange,
}: RenameChatDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const { renameChat } = useChats();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, currentTitle]);

  const handleSubmit = async () => {
    if (title.trim() && title !== currentTitle) {
      await renameChat(chatId, title.trim());
    }
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Переименовать чат</DialogTitle>
        </DialogHeader>
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}