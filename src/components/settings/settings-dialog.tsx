"use client";

import { useAuthStore } from "@/store/auth-store";
import { useShallow } from "zustand/react/shallow";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "./dialogs/edit-profile-dialog";
import { DeleteAllChatsDialog } from "./dialogs/delete-all-chats-dialog";
import { DeleteAccountDialog } from "./dialogs/delete-account-dialog";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const user = useAuthStore(useShallow((s) => s.user));
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteChatsOpen, setDeleteChatsOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const fullName = user ? `${user.first_name} ${user.last_name}` : "Пользователь";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Настройки</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-200">{fullName}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  setEditProfileOpen(true);
                }}
              >
                Изменить
              </Button>
            </div>
            <hr className="border-gray-700" />
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30"
                onClick={() => {
                  onOpenChange(false);
                  setDeleteChatsOpen(true);
                }}
              >
                Удалить все чаты
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30"
                onClick={() => {
                  onOpenChange(false);
                  setDeleteAccountOpen(true);
                }}
              >
                Удалить аккаунт
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        initialFirstName={user?.first_name || ""}
        initialLastName={user?.last_name || ""}
      />
      <DeleteAllChatsDialog
        open={deleteChatsOpen}
        onOpenChange={setDeleteChatsOpen}
      />
      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
      />
    </>
  );
}