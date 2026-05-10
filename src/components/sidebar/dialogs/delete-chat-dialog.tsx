"use client";

import { useState } from "react";
import { useChats } from "@/hooks/useChats";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteChatDialogProps {
  chatId: string;
  chatTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteChatDialog({
  chatId,
  chatTitle,
  open,
  onOpenChange,
}: DeleteChatDialogProps) {
  const { deleteChat } = useChats();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteChat(chatId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Удалить чат</DialogTitle>
          <DialogDescription>
            {chatTitle ? (
              <>
                Вы действительно хотите удалить чат <strong>{chatTitle}</strong>?
              </>
            ) : (
              "Вы действительно хотите удалить этот чат?"
            )}
            {" "}
            Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
          >
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}