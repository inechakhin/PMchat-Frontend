import { useCallback, useEffect, useRef } from 'react';
import { useMessageStore } from '@/store/message-store';
import { useChatStore } from '@/store/chat-store';
import * as chatApi from '@/lib/chat-api';
import { StreamEvent } from '@/types/types';

export const useChat = (chatId: string) => {
  const {
    messagesByChatId,
    isLoadingMessages,
    isStreamingByChatId,
    setMessages,
    addMessage,
    appendToken,
    setLoading,
    setStreaming,
  } = useMessageStore();

  const { currentChatId, setCurrentChat } = useChatStore();

  const messages = messagesByChatId[chatId] || [];
  const isLoading = isLoadingMessages[chatId] || false;
  const isStreaming = isStreamingByChatId[chatId] || false;

  // AbortController для отмены текущего стрима
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadMessages = useCallback(async () => {
    if (isLoading) return;
    setLoading(chatId, true);
    try {
      const msgs = await chatApi.getMessages(chatId);
      setMessages(chatId, msgs);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(chatId, false);
    }
  }, [chatId, isLoading, setLoading, setMessages]);

  useEffect(() => {
    if (!messages.length && !isLoading) {
      loadMessages();
    }
  }, [chatId, messages.length, isLoading, loadMessages]);

  useEffect(() => {
    if (currentChatId !== chatId) {
      setCurrentChat(chatId);
    }
  }, [chatId, currentChatId, setCurrentChat]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      if (isStreaming) return;

      // 1. Добавляем сообщение пользователя в store
      const tempUserMessage: any = {
        id: crypto.randomUUID(),
        sender_type: 'user',
        text,
        attachments: [],
        created_at: new Date().toISOString(),
      };
      addMessage(chatId, tempUserMessage);

      // 2. Отменяем предыдущий стрим, если есть
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 3. Запускаем SSE-стрим
      setStreaming(chatId, true);
      try {
        await chatApi.sendMessage(chatId, text, (event: StreamEvent) => {
          switch (event.type) {
            case 'message':
              // Приходит токен
              appendToken(chatId, event.token);
              break;
            case 'source':
              // Можно добавить источник как отдельное сообщение или метаданные
              console.log('Source:', event.title);
              break;
            case 'chat-title':
              // Обновляем название чата в store
              const { setChatLocalTitle } = useChatStore.getState();
              setChatLocalTitle(chatId, event.title);
              break;
            case 'error':
              setStreaming(chatId, false);
              console.error('Stream error:', event.message);
              // Добавим сообщение об ошибке в чат
              const errorMsg: any = {
                id: `err-${Date.now()}`,
                sender_type: 'assistant',
                text: `❌ Ошибка: ${event.message}`,
                attachments: [],
                created_at: new Date().toISOString(),
              };
              addMessage(chatId, errorMsg);
              break;
            case 'finish':
              // Стрим завершён
              setStreaming(chatId, false);
              break;
          }
        }, controller.signal);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Send message failed', error);
          const errorMsg: any = {
            id: `err-${Date.now()}`,
            sender_type: 'assistant',
            text: `❌ Не удалось отправить сообщение`,
            attachments: [],
            created_at: new Date().toISOString(),
          };
          addMessage(chatId, errorMsg);
        }
      } finally {
        setStreaming(chatId, false);
        abortControllerRef.current = null;
      }
    },
    [chatId, addMessage, appendToken, setStreaming]
  );

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    reloadMessages: loadMessages,
  };
};