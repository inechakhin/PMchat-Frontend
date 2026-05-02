import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMessageStore } from "@/store/message-store";
import { useChatStore } from "@/store/chat-store";
import * as chatApi from "@/lib/chat-api";
import { StreamEvent } from "@/types/types";

const BATCH_INTERVAL_MS = 50;

export const useChat = (chatId: string | null) => {
  const router = useRouter();

  const tokenBufferRef = useRef<string[]>([]);
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef(false);
  const typingTitleRef = useRef<string | null>(null);

  const clearBatchInterval = useCallback(() => {
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
      batchIntervalRef.current = null;
    }
  }, []);

  const flushTokenBuffer = useCallback((targetChatId: string) => {
    const tokens = tokenBufferRef.current;
    if (tokens.length === 0) return;
    useMessageStore.getState().appendTokensToStreamingMessage(targetChatId, tokens);
    tokenBufferRef.current = [];
  }, []);

  const loadMessages = useCallback(async () => {
    if (!chatId || loadingRef.current) return;

    const { setLoading, setMessages, isStreamingByChatId } = useMessageStore.getState();
    if (isStreamingByChatId[chatId]) return;

    loadingRef.current = true;
    setLoading(chatId, true);
    try {
      const msgs = await chatApi.getMessages(chatId);
      setMessages(chatId, msgs);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(chatId, false);
      loadingRef.current = false;
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) loadMessages();
  }, [chatId, loadMessages]);

  useEffect(() => {
    const { currentChatId, setCurrentChat } = useChatStore.getState();
    if (currentChatId !== chatId) setCurrentChat(chatId);
  }, [chatId]);

  const sendMessage = useCallback(async (text: string, chatType?: string) => {
    if (!text.trim()) return;

    const msgStore = useMessageStore.getState();
    const chatStore = useChatStore.getState();

    if (chatId && msgStore.isStreamingByChatId[chatId]) return;

    let effectiveChatId = chatId;
    if (!effectiveChatId) {
      try {
        const newChat = await chatApi.createChat(chatType || "communication");
        chatStore.addChat(newChat);
        effectiveChatId = newChat.id;
        router.replace(`/chat/${effectiveChatId}`);
      } catch (error) {
        console.error("Failed to create chat", error);
        return;
      }
    }

    msgStore.addUserMessage(effectiveChatId, text);
    chatStore.bumpChat(effectiveChatId);
    msgStore.startStreamingMessage(effectiveChatId);
    msgStore.setStreaming(effectiveChatId, true);

    typingTitleRef.current = null;
    tokenBufferRef.current = [];

    clearBatchInterval();
    batchIntervalRef.current = setInterval(() => {
      if (effectiveChatId) flushTokenBuffer(effectiveChatId);
    }, BATCH_INTERVAL_MS);

    const controller = msgStore.createStreamController(effectiveChatId);

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
              msgStore.addAttachmentToStreamingMessage(effectiveChatId!, event);
              break;
            case "source":
              msgStore.addSourceToStreamingMessage(effectiveChatId!, event);
              break;
            case "chat-title":
              if (typingTitleRef.current === null) {
                typingTitleRef.current = event.title;
                chatStore.updateChatTitle(effectiveChatId!, event.title);
              }
              break;
            case "error":
              throw new Error(event.message);
          }
        },
        controller.signal
      );
    } catch (error: any) {
      if (error.name !== "AbortError") {
        msgStore.updateLastAssistantMessage(effectiveChatId, (msg) => ({
          ...msg,
          text: `❌ Ошибка: ${error.message}`,
        }));
      }
    } finally {
      flushTokenBuffer(effectiveChatId);
      clearBatchInterval();
      msgStore.finishStreamingMessage(effectiveChatId);
      msgStore.setStreaming(effectiveChatId, false);
      msgStore.removeStreamController(effectiveChatId);
    }
  }, [chatId, router, clearBatchInterval, flushTokenBuffer]);

  const abortStream = useCallback(() => {
    if (chatId) {
      flushTokenBuffer(chatId);
      clearBatchInterval();
      useMessageStore.getState().abortStreamController(chatId);
    }
  }, [chatId, clearBatchInterval, flushTokenBuffer]);

  return {
    sendMessage,
    abortStream,
    reloadMessages: loadMessages,
  };
};