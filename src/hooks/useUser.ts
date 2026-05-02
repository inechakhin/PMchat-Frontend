import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { useMessageStore } from '@/store/message-store';
import * as userApi from '@/lib/user-api';
import * as chatApi from '@/lib/chat-api';

export const useUser = () => {

  const updateProfile = useCallback(async (data: any) => {
    const updated = await userApi.updateProfile(data);
    useAuthStore.getState().setUser(updated);
    return updated;
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      await chatApi.deleteAllChats();
      await userApi.deleteProfile();
    } finally {
      useAuthStore.getState().reset();
      useChatStore.getState().reset();
      useMessageStore.getState().reset();
    }
  }, []);

  return { 
    updateProfile,
    deleteAccount,
  };
};