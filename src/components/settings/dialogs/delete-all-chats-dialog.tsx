"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/useChats";

interface DeleteAllChatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAllChatsDialog({ open, onOpenChange }: DeleteAllChatsDialogProps) {
  const { deleteAllChats } = useChats();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAllChats();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete all chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Удалить все чаты</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите безвозвратно удалить все ваши чаты? Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
            onClick={handleDelete}
            isLoading={isLoading}
          >
            Удалить все
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}