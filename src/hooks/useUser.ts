import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { useMessageStore } from '@/store/message-store';
import * as userApi from '@/lib/user-api';
import * as chatApi from '@/lib/chat-api';
import { UpdateProfileRequest } from '@/types/types';

export const useUser = () => {
  const { 
    user, 
    setUser, 
    reset 
  } = useAuthStore();
  const resetChats = useChatStore((s) => s.reset);
  const resetMessages = useMessageStore((s) => s.reset);

  const updateProfile = async (data: UpdateProfileRequest) => {
    const updated = await userApi.updateProfile(data);
    setUser(updated);
    return updated;
  };

  const deleteAccount = async () => {
    try {
      await chatApi.deleteAllChats();
      await userApi.deleteProfile();
    } finally {
      reset();
      resetChats();
      resetMessages();
    }
  };

  return {
    user,
    updateProfile,
    deleteAccount,
  };
};