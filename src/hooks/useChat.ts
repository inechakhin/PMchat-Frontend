import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { useMessageStore } from '@/store/message-store';
import { useChatStore } from '@/store/chat-store';
import * as chatApi from '@/lib/chat-api';
import { StreamEvent } from '@/types/types';

export const useChat = (chatId: string | null) => {
  const router = useRouter();
  const {
    messagesByChatId,
    isLoadingMessages,
    isStreamingByChatId,
    setMessages,
    addMessage,
    setLoading,
    setStreaming,
    startStreamingMessage,
    appendTokenToStreamingMessage,
    finishStreamingMessage,
  } = useMessageStore();

  const { currentChatId, setCurrentChat, addChat, updateChatTitle } = useChatStore();

  const messages = chatId ? messagesByChatId[chatId] || [] : [];
  const isLoading = chatId ? isLoadingMessages[chatId] || false : false;
  const isStreaming = chatId ? isStreamingByChatId[chatId] || false : false;

  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);

  const loadMessages = useCallback(async () => {
    if (!chatId || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(chatId, true);
    try {
      const msgs = await chatApi.getMessages(chatId);
      setMessages(chatId, msgs);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(chatId, false);
      loadingRef.current = false;
    }
  }, [chatId, setLoading, setMessages]);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
  }, [chatId, loadMessages]);

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
      if (!text.trim() || isStreaming) return;

      let effectiveChatId = chatId;
      if (!effectiveChatId) {
        try {
          const newChat = await chatApi.createChat();
          addChat(newChat);
          effectiveChatId = newChat.id;
          router.replace(`/chat/${effectiveChatId}`);
          return;
        } catch (error) {
          console.error('Failed to create chat', error);
          return;
        }
      }
      
      const userMessage = {
        id: crypto.randomUUID(),
        sender_type: 'user' as const,
        text,
        attachments: [],
        created_at: new Date().toISOString(),
      };
      addMessage(effectiveChatId, userMessage);

      // Отменяем предыдущий стрим
      abortControllerRef.current?.abort();
      setStreaming(effectiveChatId, false);
      const controller = new AbortController();
      abortControllerRef.current = controller;

      startStreamingMessage(effectiveChatId);
      setStreaming(effectiveChatId, true);
      try {
        await chatApi.sendMessage(
          effectiveChatId,
          text,
          (event: StreamEvent) => {
            switch (event.type) {
              case 'message':
                appendTokenToStreamingMessage(effectiveChatId, event.token);
                break;
              case 'source':
                // Обработка источника при необходимости
                break;
              case 'chat-title':
                updateChatTitle(effectiveChatId, event.title);
                break;
              case 'error':
                addMessage(effectiveChatId, {
                  id: crypto.randomUUID(),
                  sender_type: 'assistant',
                  text: `❌ Ошибка: ${event.message}`,
                  attachments: [],
                  created_at: new Date().toISOString(),
                });
                break;
              case 'finish':
                break;
            }
          },
          controller.signal
        );
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Send message failed', error);
          addMessage(effectiveChatId, {
            id: crypto.randomUUID(),
            sender_type: 'assistant',
            text: `❌ Не удалось отправить сообщение`,
            attachments: [],
            created_at: new Date().toISOString(),
          });
        }
      } finally {
        finishStreamingMessage(effectiveChatId);
        setStreaming(effectiveChatId, false);
        abortControllerRef.current = null;
      }
    },
    [
      chatId,
      isStreaming,
      addMessage,
      startStreamingMessage,
      appendTokenToStreamingMessage,
      finishStreamingMessage,
      setStreaming,
      updateChatTitle,
      addChat,
      router,
    ]
  );

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    reloadMessages: loadMessages,
  };
};