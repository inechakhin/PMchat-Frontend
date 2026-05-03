import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat-store';
import { useMessageStore } from '@/store/message-store';
import * as chatApi from '@/lib/chat-api';

export const useChats = () => {
  const router = useRouter();

  const fetchChats = useCallback(async () => {
    const { setLoading, setChats } = useChatStore.getState();
    setLoading(true);
    try {
      const data = await chatApi.getChats();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createChat = useCallback(async (type: string) => {
    const { setLoading, addChat } = useChatStore.getState();
    setLoading(true);
    try {
      const newChat = await chatApi.createChat(type);
      addChat(newChat);
      router.push(`/chat/${newChat.id}`);
      return newChat;
    } catch (error) {
      console.error('Failed to create chat', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const deleteChat = useCallback(async (chatId: string) => {
    const { currentChatId, setLoading, removeChat } = useChatStore.getState();
    const { clearMessages } = useMessageStore.getState();

    setLoading(true);
    try {
      await chatApi.deleteChat(chatId);
      removeChat(chatId);
      clearMessages(chatId);
      
      if (currentChatId === chatId) {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to delete chat', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const renameChat = useCallback(async (chatId: string, title: string) => {
    const { updateChatTitle } = useChatStore.getState();
    
    try {
      const updated = await chatApi.renameChat(chatId, title);
      updateChatTitle(chatId, updated.title);
      await fetchChats();
    } catch (error) {
      console.error('Failed to rename chat', error);
      throw error;
    }
  }, [fetchChats]);

  const deleteAllChats = useCallback(async () => {
    const { setLoading, reset } = useChatStore.getState();
    const { reset: resetMessages } = useMessageStore.getState();

    setLoading(true);
    try {
      await chatApi.deleteAllChats();
      reset();
      resetMessages();
      router.push('/');
    } catch (error) {
      console.error('Failed to delete all chats', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    fetchChats,
    createChat,
    deleteChat,
    renameChat,
    deleteAllChats,
    setCurrentChat: useChatStore.getState().setCurrentChat,
  };
};