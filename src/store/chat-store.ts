import { create } from 'zustand';
import { ChatPreview, Chat } from '@/types/types';
import * as chatApi from '@/lib/chat-api';

interface ChatState {
  chats: ChatPreview[];
  currentChatId: string | null;
  isLoading: boolean;
  setChats: (chats: ChatPreview[]) => void;
  setCurrentChat: (chatId: string | null) => void;
  setChatLocalTitle: (chatId: string, title: string) => void;
  fetchChats: () => Promise<void>;
  createChat: () => Promise<Chat>;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, title: string) => Promise<void>;
  deleteAllChats: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,
  isLoading: false,

  setChats: (chats) => set({ chats }),
  
  setCurrentChat: (chatId) => set({ currentChatId: chatId }),
  
  setChatLocalTitle: (chatId, title) => {
    const newChats = get().chats.map((c) =>
      c.id === chatId ? { ...c, title: title } : c
    );
    set({ chats: newChats });
  },

  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const chats = await chatApi.getChats();
      set({ chats, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createChat: async () => {
    set({ isLoading: true });
    try {
      const newChat = await chatApi.createChat();
      const currentChats = get().chats;
      set({
        chats: [newChat, ...currentChats],
        currentChatId: newChat.id,
        isLoading: false,
      });
      return newChat;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteChat: async (chatId) => {
    set({ isLoading: true });
    try {
      await chatApi.deleteChat(chatId);
      const newChats = get().chats.filter((c) => c.id !== chatId);
      const newCurrentId = get().currentChatId === chatId ? null : get().currentChatId;
      set({ chats: newChats, currentChatId: newCurrentId, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  renameChat: async (chatId, title) => {
    try {
      const updated = await chatApi.renameChat(chatId, title);
      get().setChatLocalTitle(chatId, updated.title);
    } catch (error) {
      throw error;
    }
  },

  deleteAllChats: async () => {
    set({ isLoading: true });
    try {
      await chatApi.deleteAllChats();
      set({ chats: [], currentChatId: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));