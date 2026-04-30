import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMessageStore } from "@/store/message-store";
import { useChatStore } from "@/store/chat-store";
import * as chatApi from "@/lib/chat-api";
import { StreamEvent } from "@/types/types";

const BATCH_INTERVAL_MS = 50;

export const useChat = (chatId: string | null) => {
  const router = useRouter();
  const {
    messagesByChatId,
    isLoadingMessages,
    isStreamingByChatId,
    setMessages,
    addUserMessage,
    setLoading,
    setStreaming,
    startStreamingMessage,
    appendTokensToStreamingMessage,
    addAttachmentToStreamingMessage,
    addSourceToStreamingMessage,
    finishStreamingMessage,
    updateLastAssistantMessage,
    createStreamController,
    abortStreamController,
    removeStreamController,
  } = useMessageStore();

  const {
    currentChatId,
    setCurrentChat,
    addChat,
    updateChatTitle,
    bumpChat,
  } = useChatStore();

  const loadingRef = useRef(false);
  const typingTitleRef = useRef<string | null>(null);

  const messages = chatId ? messagesByChatId[chatId] || [] : [];
  const isLoading = chatId ? isLoadingMessages[chatId] || false : false;
  const isStreaming = chatId ? isStreamingByChatId[chatId] || false : false;

  const tokenBufferRef = useRef<string[]>([]);
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const flushTokenBuffer = useCallback((targetChatId: string) => {
    const tokens = tokenBufferRef.current;
    if (tokens.length === 0) return;
    appendTokensToStreamingMessage(targetChatId, tokens);
    tokenBufferRef.current = [];
  }, [appendTokensToStreamingMessage]);

  const clearBatchInterval = useCallback(() => {
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
      batchIntervalRef.current = null;
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!chatId || loadingRef.current || isStreamingByChatId[chatId]) return;
    loadingRef.current = true;
    setLoading(chatId, true);
    try {
      const msgs = await chatApi.getMessages(chatId);
      setMessages(chatId, msgs);
    } catch (error) {
      console.error("Failed to load messages for chat", chatId, error);
    } finally {
      setLoading(chatId, false);
      loadingRef.current = false;
    }
  }, [chatId, setLoading, setMessages]);

  useEffect(() => {
    if (chatId) loadMessages();
  }, [chatId, loadMessages]);

  useEffect(() => {
    if (currentChatId !== chatId) setCurrentChat(chatId);
  }, [chatId, currentChatId, setCurrentChat]);

  const sendMessage = useCallback(
    async (text: string, chatType?: string) => {
      if (!text.trim() || isStreaming) return;

      let effectiveChatId = chatId;
      if (!effectiveChatId) {
        try {
          const newChat = await chatApi.createChat(chatType || "communication");
          addChat(newChat);
          effectiveChatId = newChat.id;
          router.replace(`/chat/${effectiveChatId}`);
        } catch (error) {
          console.error("Failed to create chat", error);
          return;
        }
      }

      addUserMessage(effectiveChatId, text);
      bumpChat(effectiveChatId);

      startStreamingMessage(effectiveChatId);
      setStreaming(effectiveChatId, true);
      typingTitleRef.current = null;
      tokenBufferRef.current = [];

      clearBatchInterval();
      batchIntervalRef.current = setInterval(() => {
        flushTokenBuffer(effectiveChatId);
      }, BATCH_INTERVAL_MS);

      const controller = createStreamController(effectiveChatId);
      try {
        await chatApi.sendMessage(
          effectiveChatId,
          text,
          (event: StreamEvent) => {
            switch (event.type) {
              case "message":
                tokenBufferRef.current.push(event.token);
                break;
              case "attachment":
                addAttachmentToStreamingMessage(effectiveChatId, {
                  id: event.id,
                  title: event.title,
                  size: event.size,
                  content_type: event.content_type
                });
                break;
              case "source":
                addSourceToStreamingMessage(effectiveChatId, {
                  id: event.id,
                  title: event.title,
                });
                break;
              case "chat-title":
                bumpChat(effectiveChatId);
                if (typingTitleRef.current === null) {
                  typingTitleRef.current = event.title;
                  updateChatTitle(effectiveChatId, event.title);
                }
                break;
              case "error":
                flushTokenBuffer(effectiveChatId);
                finishStreamingMessage(effectiveChatId);
                setStreaming(effectiveChatId, false);
                updateLastAssistantMessage(effectiveChatId, (msg) => ({
                  ...msg,
                  text: `❌ Ошибка: ${event.message}`,
                }));
                break;
              default:
                break;
            }
          },
          controller.signal,
          (error) => {
            const errorMsg = error.message.includes('401')
              ? 'Сессия истекла, обновляем страницу...'
              : error.message;

            updateLastAssistantMessage(effectiveChatId!, (msg) => ({
              ...msg,
              text: `❌ Ошибка: ${errorMsg}`,
            }));
          }
        );
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Send message failed", error);
          updateLastAssistantMessage(effectiveChatId, (msg) => ({
            ...msg,
            text: `❌ Не удалось отправить сообщение`,
          }));
        }
      } finally {
        flushTokenBuffer(effectiveChatId);
        clearBatchInterval();
        finishStreamingMessage(effectiveChatId);
        setStreaming(effectiveChatId, false);
        removeStreamController(effectiveChatId);
      }
    },
    [
      chatId,
      isStreaming,
      addUserMessage,
      bumpChat,
      startStreamingMessage,
      appendTokensToStreamingMessage,
      addAttachmentToStreamingMessage,
      addSourceToStreamingMessage,
      finishStreamingMessage,
      updateLastAssistantMessage,
      setStreaming,
      updateChatTitle,
      addChat,
      router,
      createStreamController,
      removeStreamController,
      flushTokenBuffer,
      clearBatchInterval,
    ]
  );

  const abortStream = useCallback(() => {
    if (chatId) {
      flushTokenBuffer(chatId);
      clearBatchInterval();
      abortStreamController(chatId);
    }
  }, [chatId, abortStreamController, flushTokenBuffer, clearBatchInterval]);

  return {
    currentChatId,
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    reloadMessages: loadMessages,
    abortStream,
  };
};