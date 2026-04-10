import { useInputStore } from '@/store/input-store';
import { useCallback } from 'react';

export const useChatInput = (chatId: string) => {
  const { drafts, setDraft, clearDraft} = useInputStore();

  const text = drafts[chatId] || '';

  const setText = useCallback(
    (newText: string) => {
      setDraft(chatId, newText);
    },
    [chatId, setDraft]
  );

  const clear = useCallback(() => {
    clearDraft(chatId);
  }, [chatId, clearDraft]);

  return { text, setText, clear };
};