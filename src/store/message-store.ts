import { create } from 'zustand';
import { Message } from '@/types/types';

interface MessageState {
  messagesByChatId: Record<string, Message[]>;
  isLoadingMessages: Record<string, boolean>;
  isStreamingByChatId: Record<string, boolean>;
  streamingMessageIdByChatId: Record<string, string | null>;
  setAllChatMessages: (messagesByChatId: Record<string, Message[]>) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  clearMessages: (chatId: string) => void;
  setLoading: (chatId: string, isLoading: boolean) => void;
  setStreaming: (chatId: string, isStreaming: boolean) => void;
  startStreamingMessage: (chatId: string) => string;
  appendTokenToStreamingMessage: (chatId: string, token: string) => void;
  finishStreamingMessage: (chatId: string) => void;
  reset: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByChatId: {},
  isLoadingMessages: {},
  isStreamingByChatId: {},
  streamingMessageIdByChatId: {},

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

  startStreamingMessage: (chatId) => {
    const messageId = crypto.randomUUID();
    set((state) => {
      if (state.streamingMessageIdByChatId[chatId]) return state;
      const newMessage = {
        id: messageId,
        sender_type: 'assistant' as const,
        text: '',
        attachments: [],
        created_at: new Date().toISOString(),
      };
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: [...(state.messagesByChatId[chatId] || []), newMessage],
        },
        streamingMessageIdByChatId: {
          ...state.streamingMessageIdByChatId,
          [chatId]: messageId,
        },
      };
    });
    return messageId;
  },

  appendTokenToStreamingMessage: (chatId, token) => {
    set((state) => {
      const messageId = state.streamingMessageIdByChatId[chatId];
      if (!messageId) return state;

      const messages = state.messagesByChatId[chatId] || [];
      const lastIndex = messages.length - 1;
      const updatedMessages = [...messages];
      updatedMessages[lastIndex] = {
        ...updatedMessages[lastIndex],
        text: updatedMessages[lastIndex].text + token,
      };

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: updatedMessages,
        },
      };
    });
  },

  finishStreamingMessage: (chatId) => {
    set((state) => ({
      streamingMessageIdByChatId: {
        ...state.streamingMessageIdByChatId,
        [chatId]: null,
      },
    }));
  },

  reset: () =>
    set({
      messagesByChatId: {},
      isLoadingMessages: {},
      isStreamingByChatId: {},
      streamingMessageIdByChatId: {},
    }),
}));