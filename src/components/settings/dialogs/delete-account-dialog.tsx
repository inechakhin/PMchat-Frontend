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
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { deleteAccount } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      onOpenChange(false);
      router.push("/login"); // или на главную после удаления
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Удалить аккаунт</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите полностью удалить свой аккаунт? Все ваши данные, включая чаты, будут безвозвратно удалены.
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
            Удалить аккаунт
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}