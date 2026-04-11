import { create } from 'zustand';
import { Message } from '@/types/types';

interface MessageState {
  messagesByChatId: Record<string, Message[]>;
  isLoadingMessages: Record<string, boolean>;
  isStreamingByChatId: Record<string, boolean>;
  streamingMessageIdByChatId: Record<string, string | null>;
  streamControllers: Record<string, AbortController>;

  setAllChatMessages: (messagesByChatId: Record<string, Message[]>) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  clearMessages: (chatId: string) => void;
  setLoading: (chatId: string, isLoading: boolean) => void;
  setStreaming: (chatId: string, isStreaming: boolean) => void;
  startStreamingMessage: (chatId: string) => string;
  appendTokenToStreamingMessage: (chatId: string, token: string) => void;
  addAttachmentToStreamingMessage: (chatId: string, title: string) => void;
  finishStreamingMessage: (chatId: string) => void;
  updateLastAssistantMessage: (chatId: string, updater: (msg: Message) => Message) => void;
  getStreamController: (chatId: string) => AbortController | undefined;
  createStreamController: (chatId: string) => AbortController;
  abortStreamController: (chatId: string) => void;
  removeStreamController: (chatId: string) => void;
  reset: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByChatId: {},
  isLoadingMessages: {},
  isStreamingByChatId: {},
  streamingMessageIdByChatId: {},
  streamControllers: {},

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

  clearMessages: (chatId) => {
    get().streamControllers[chatId]?.abort();
    set((state) => {
      const { [chatId]: _, ...restMessages } = state.messagesByChatId;
      const { [chatId]: __, ...restStreaming } = state.isStreamingByChatId;
      const { [chatId]: ___, ...restStreamingId } = state.streamingMessageIdByChatId;
      const { [chatId]: ____, ...restControllers } = state.streamControllers;
      return {
        messagesByChatId: restMessages,
        isStreamingByChatId: restStreaming,
        streamingMessageIdByChatId: restStreamingId,
        streamControllers: restControllers,
      };
    });
  },

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
      const lastMessage = messages[lastIndex];
      if (lastMessage.id !== messageId || lastMessage.sender_type !== 'assistant') return state;

      const updatedMessage = {
        ...lastMessage,
        text: lastMessage.text + token,
      }

      const updatedMessages = [...messages];
      updatedMessages[lastIndex] = updatedMessage;

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: updatedMessages,
        },
      };
    });
  },

  addAttachmentToStreamingMessage: (chatId, title) => {
    set((state) => {
      const messageId = state.streamingMessageIdByChatId[chatId];
      if (!messageId) return state;

      const messages = state.messagesByChatId[chatId] || [];
      const lastIndex = messages.length - 1;
      const lastMessage = messages[lastIndex];
      if (lastMessage.id !== messageId || lastMessage.sender_type !== 'assistant') return state;

      const existingTitles = new Set(lastMessage.attachments.map((a) => a.title));
      if (existingTitles.has(title)) return state;

      const updatedMessage = {
        ...lastMessage,
        attachments: [...lastMessage.attachments, { title }],
      };

      const updatedMessages = [...messages];
      updatedMessages[lastIndex] = updatedMessage;

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

  updateLastAssistantMessage: (chatId, updater) =>
    set((state) => {
      const msgs = state.messagesByChatId[chatId] || [];
      if (msgs.length === 0) return state;
      const last = msgs[msgs.length - 1];
      if (last.sender_type !== "assistant") return state;
      const updated = [...msgs];
      updated[updated.length - 1] = updater(last);
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: updated,
        },
      };
    }),

  getStreamController: (chatId) => get().streamControllers[chatId],

  createStreamController: (chatId) => {
    console.log(`[Stream] create controller for ${chatId}`);
    const existing = get().streamControllers[chatId];
    if (existing) {
      console.trace(`[Stream] aborting existing controller for ${chatId}`);
      existing.abort();
    }
    const controller = new AbortController();
    set((state) => ({
      streamControllers: { ...state.streamControllers, [chatId]: controller },
    }));
    return controller;
  },

  abortStreamController: (chatId) => {
    console.trace(`[Stream] abort called for ${chatId}`);
    get().streamControllers[chatId]?.abort();
    set((state) => {
      const { [chatId]: _, ...rest } = state.streamControllers;
      return { streamControllers: rest };
    });
  },

  removeStreamController: (chatId) => {
    set((state) => {
      const { [chatId]: _, ...rest } = state.streamControllers;
      return { streamControllers: rest };
    });
  },

  reset: () =>
    set({
      messagesByChatId: {},
      isLoadingMessages: {},
      isStreamingByChatId: {},
      streamingMessageIdByChatId: {},
      streamControllers: {},
    }),
}));