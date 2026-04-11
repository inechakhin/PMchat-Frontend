import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMessageStore } from "@/store/message-store";
import { useChatStore } from "@/store/chat-store";
import * as chatApi from "@/lib/chat-api";
import { StreamEvent } from "@/types/types";

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
    addAttachmentToStreamingMessage,
    finishStreamingMessage,
    createStreamController,
    abortStreamController,
    removeStreamController,
  } = useMessageStore();

  const {
    currentChatId,
    setCurrentChat,
    addChat,
    updateChatTitle,
  } = useChatStore();

  const loadingRef = useRef(false);
  const typingTitleRef = useRef<string | null>(null);

  const messages = chatId ? messagesByChatId[chatId] || [] : [];
  const isLoading = chatId ? isLoadingMessages[chatId] || false : false;
  const isStreaming = chatId ? isStreamingByChatId[chatId] || false : false;

  const loadMessages = useCallback(async () => {
    if (!chatId || loadingRef.current) return;
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
  }, [chatId, setLoading, setMessages]);

  useEffect(() => {
    if (chatId) loadMessages();
  }, [chatId, loadMessages]);

  useEffect(() => {
    if (currentChatId !== chatId) setCurrentChat(chatId);
  }, [chatId, currentChatId, setCurrentChat]);

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
        } catch (error) {
          console.error("Failed to create chat", error);
          return;
        }
      }

      // Добавляем сообщение пользователя
      const userMessage = {
        id: crypto.randomUUID(),
        sender_type: "user" as const,
        text,
        attachments: [],
        created_at: new Date().toISOString(),
      };
      addMessage(effectiveChatId, userMessage);

      // Начинаем стрим ассистента
      startStreamingMessage(effectiveChatId);
      setStreaming(effectiveChatId, true);
      typingTitleRef.current = null; // сбрасываем перед новым стримом

      const controller = createStreamController(effectiveChatId)
      try {
        await chatApi.sendMessage(
          effectiveChatId,
          text,
          (event: StreamEvent) => {
            switch (event.type) {
              case "message":
                appendTokenToStreamingMessage(effectiveChatId, event.token);
                break;
              case "source":
                addAttachmentToStreamingMessage(effectiveChatId, event.title);
                break;
              case "chat-title":
                // Обновляем заголовок только один раз за стрим
                if (typingTitleRef.current === null) {
                  typingTitleRef.current = event.title;
                  updateChatTitle(effectiveChatId, event.title);
                }
                break;
              case "error":
                finishStreamingMessage(effectiveChatId);
                setStreaming(effectiveChatId, false);
                useMessageStore.getState().updateLastAssistantMessage(effectiveChatId, (msg) => ({
                  ...msg,
                  text: `❌ Ошибка: ${event.message}`,
                }));
                break;
              default:
                break;
            }
          },
          controller.signal
        );
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Send message failed", error);
          useMessageStore.getState().updateLastAssistantMessage(effectiveChatId, (msg) => ({
            ...msg,
            text: `❌ Не удалось отправить сообщение`,
          }));
        }
      } finally {
        finishStreamingMessage(effectiveChatId);
        setStreaming(effectiveChatId, false);
        removeStreamController(effectiveChatId);
      }
    },
    [
      chatId,
      isStreaming,
      addMessage,
      startStreamingMessage,
      appendTokenToStreamingMessage,
      addAttachmentToStreamingMessage,
      finishStreamingMessage,
      setStreaming,
      updateChatTitle,
      addChat,
      router,
      createStreamController,
      removeStreamController,
    ]
  );

  const abortStream = useCallback(() => {
    if (chatId) abortStreamController(chatId);
  }, [chatId, abortStreamController]);

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    reloadMessages: loadMessages,
    abortStream,
  };
};