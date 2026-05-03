"use client";

import { useAuthStore } from "@/store/auth-store";
import { useShallow } from "zustand/react/shallow";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";

export function UserProfile() {
  const user = useAuthStore(useShallow((s) => s.user));
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!user) return null;

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U";

  return (
    <>
      <button
        onClick={() => setSettingsOpen(true)}
        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-800 transition-colors group"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left truncate">
          <p className="text-sm font-medium text-gray-200 truncate">
            {user.first_name} {user.last_name}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}