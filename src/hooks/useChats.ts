import { useChatStore } from '@/store/chat-store';
import { useEffect } from 'react';

export const useChats = () => {
  const {
    chats,
    currentChatId,
    isLoading,
    fetchChats,
    createChat,
    deleteChat,
    renameChat,
    deleteAllChats,
    setCurrentChat,
  } = useChatStore();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    currentChatId,
    isLoading,
    createChat,
    deleteChat,
    renameChat,
    deleteAllChats,
    setCurrentChat,
    refetch: fetchChats,
  };
};