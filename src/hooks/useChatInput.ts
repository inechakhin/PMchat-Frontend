import { useInputStore } from '@/store/input-store';
import { useCallback } from 'react';

export const useChatInput = (chatId: string) => {
  const drafts = useInputStore((state) => state.drafts);
  const setDraft = useInputStore((state) => state.setDraft);
  const clearDraft = useInputStore((state) => state.clearDraft);

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