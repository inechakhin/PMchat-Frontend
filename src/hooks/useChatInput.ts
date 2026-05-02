import { useCallback } from 'react';
import { useInputStore } from '@/store/input-store';

export const useChatInput = (chatId: string) => {
  const setDraft = useInputStore((s) => s.setDraft);
  const clearDraft = useInputStore((s) => s.clearDraft);

  const setText = useCallback(
    (newText: string) => {
      setDraft(chatId, newText);
    },
    [chatId, setDraft]
  );

  const clear = useCallback(() => {
    clearDraft(chatId);
  }, [chatId, clearDraft]);

  return { setText, clear };
};