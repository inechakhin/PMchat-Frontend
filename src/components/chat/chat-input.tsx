"use client";

import { useChatInput } from "@/hooks/useChatInput";
import { useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  chatId: string;
  onSendMessage: (text: string) => Promise<void>;
  isStreaming?: boolean;
}

export function ChatInput({ chatId, onSendMessage, isStreaming }: ChatInputProps) {
  const { text, setText, clear } = useChatInput(chatId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 200;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() || isStreaming) return;
    await onSendMessage(text);
    clear();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900/50 p-3">
      <div className="max-w-3xl mx-auto relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение..."
          className="w-full resize-none bg-gray-800 rounded-xl pl-4 pr-12 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          rows={1}
          style={{ minHeight: "45px", maxHeight: "200px" }}
          disabled={isStreaming}
        />
        <Button
          type="button"
          size="icon"
          className="absolute right-2 bottom-2 rounded-full"
          onClick={handleSubmit}
          disabled={!text.trim() || isStreaming}
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}