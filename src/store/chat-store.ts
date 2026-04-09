import { create } from 'zustand';
import { ChatPreview, Chat } from '@/types/types';

interface ChatState {
  chats: ChatPreview[];
  currentChatId: string | null;
  isLoading: boolean;
  setChats: (chats: ChatPreview[]) => void;
  setCurrentChat: (chatId: string | null) => void;
  setLoading: (loading: boolean) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  addChat: (chat: Chat | ChatPreview) => void;
  removeChat: (chatId: string) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,
  isLoading: false,

  setChats: (chats) => set({ chats }),
  setCurrentChat: (chatId) => set({ currentChatId: chatId }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  updateChatTitle: (chatId, title) => {
    const newChats = get().chats.map((c) =>
      c.id === chatId ? { ...c, title } : c
    );
    set({ chats: newChats });
  },
  
  addChat: (chat) => {
    set((state) => ({
      chats: [chat, ...state.chats],
      currentChatId: chat.id,
    }));
  },
  
  removeChat: (chatId) => {
    set((state) => {
      const newChats = state.chats.filter((c) => c.id !== chatId);
      const newCurrentId = state.currentChatId === chatId ? null : state.currentChatId;
      return { chats: newChats, currentChatId: newCurrentId };
    });
  },
  
  reset: () => set({ chats: [], currentChatId: null, isLoading: false }),
}));