import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat-store';
import { useMessageStore } from '@/store/message-store';
import * as chatApi from '@/lib/chat-api';

export const useChats = () => {
  const router = useRouter();
  const {
    chats,
    currentChatId,
    isLoading,
    setChats,
    setCurrentChat,
    setLoading,
    addChat,
    removeChat,
    updateChatTitle,
    reset,
  } = useChatStore();

  const clearMessages = useMessageStore((s) => s.clearMessages);
  const resetMessages = useMessageStore((s) => s.reset);

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [chats]);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await chatApi.getChats();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats', error);
    } finally {
      setLoading(false);
    }
  }, [setChats, setLoading]);

  const createChat = useCallback(async () => {
    setLoading(true);
    try {
      const newChat = await chatApi.createChat();
      addChat(newChat);
      router.push(`/chat/${newChat.id}`);
      return newChat;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, addChat, router]);

  const deleteChat = useCallback(
    async (chatId: string) => {
      setLoading(true);
      try {
        await chatApi.deleteChat(chatId);
        removeChat(chatId);
        clearMessages(chatId);
        if (currentChatId === chatId) {
          router.push('/');
        }
      } catch (error) {
        setLoading(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, removeChat, clearMessages, currentChatId, chats, router]
  );

  const renameChat = useCallback(
    async (chatId: string, title: string) => {
      try {
        const updated = await chatApi.renameChat(chatId, title);
        updateChatTitle(chatId, updated.title);
        await fetchChats();
      } catch (error) {
        throw error;
      }
    },
    [updateChatTitle, fetchChats]
  );

  const deleteAllChats = useCallback(async () => {
    setLoading(true);
    try {
      await chatApi.deleteAllChats();
      reset();
      resetMessages();
      router.push('/');
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, reset, resetMessages, router]);

  return {
    chats: sortedChats,
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