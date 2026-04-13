import { useCallback } from 'react';
import { useInputStore } from '@/store/input-store';

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