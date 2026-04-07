import { create } from 'zustand';
import { Message } from '@/types/types';

interface MessageState {
  messagesByChatId: Record<string, Message[]>;
  isLoadingMessages: Record<string, boolean>;
  isStreamingByChatId: Record<string, boolean>;

  setAllChatMessages: (messagesByChatId: Record<string, Message[]>) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  appendToken: (chatId: string, token: string) => void; // для стриминга
  clearMessages: (chatId: string) => void;
  setLoading: (chatId: string, isLoading: boolean) => void;
  setStreaming: (chatId: string, isStreaming: boolean) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByChatId: {},
  isLoadingMessages: {},
  isStreamingByChatId: {},

  setAllChatMessages: (messagesByChatId) => set({ messagesByChatId }),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messagesByChatId: { ...state.messagesByChatId, [chatId]: messages },
    })),

  addMessage: (chatId, message) =>
    set((state) => {
      const current = state.messagesByChatId[chatId] || [];
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: [...current, message],
        },
      };
    }),

  appendToken: (chatId, token) =>
    set((state) => {
      const messages = state.messagesByChatId[chatId];
      if (!messages || messages.length === 0) return state;

      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender_type === 'assistant') {
        // Если последнее сообщение от ассистента – добавляем токен
        const updatedLast = {
          ...lastMessage,
          text: lastMessage.text + token,
        };
        const updatedMessages = [...messages.slice(0, -1), updatedLast];
        return {
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: updatedMessages,
          },
        };
      } else {
        // Создаём новое сообщение ассистента
        const newAssistantMsg: Message = {
          id: `temp-${Date.now()}`,
          sender_type: 'assistant',
          text: token,
          attachments: [],
          created_at: new Date().toISOString(),
        };
        return {
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: [...messages, newAssistantMsg],
          },
        };
      }
    }),

  clearMessages: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...rest } = state.messagesByChatId;
      return { messagesByChatId: rest };
    }),

  setLoading: (chatId, isLoading) =>
    set((state) => ({
      isLoadingMessages: { ...state.isLoadingMessages, [chatId]: isLoading },
    })),

  setStreaming: (chatId, isStreaming) =>
    set((state) => ({
      isStreamingByChatId: {
        ...state.isStreamingByChatId,
        [chatId]: isStreaming,
      },
    })),
}));