"use client";

import { Message } from "@/types/types";
import { cn } from "@/utils/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Copy, Check, BookOpen } from "lucide-react";
import { AnimatedMarkdown } from "flowtoken";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.sender_type === "user";
  const [isCopied, setIsCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      const text = contentRef.current?.textContent?.trim() || message.text?.trim() || "";
      if (!text) return;
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const hasAttachments = !isUser && message.attachments.length > 0;
  const showActions = !!message.text?.trim() || hasAttachments;

  return (
    <div className={cn("flex gap-3 group", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-blue-600 text-white">
            <Bot size={16} />
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col max-w-[80%]">
        <div
          className={cn(
            "rounded-lg px-4 py-2 text-sm",
            isUser ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
          )}
        >
          <div ref={contentRef}>
            {!isUser ? (
              <div className="prose prose-sm prose-invert max-w-none">
                {isStreaming && !message.text ? (
                  <div className="h-6 w-32 animate-pulse rounded-full bg-gray-600/20" />
                ) : isStreaming ? (
                  <AnimatedMarkdown
                    content={message.text}
                    animation="fadeIn"
                    animationDuration="0.6s"
                    animationTimingFunction="ease-in-out"
                  />
                ) : (
                  <AnimatedMarkdown content={message.text} animation={null} />
                )}
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            )}
          </div>
        </div>

        {/* Кнопки действий под сообщением */}
        {showActions && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            {/* Кнопка копирования */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={cn(
                "h-8 w-8",
                isCopied
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white"
              )}
              aria-label="Копировать текст"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </Button>

            {/* Кнопка источников через Popover */}
            {hasAttachments && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white"
                    aria-label="Показать источники"
                  >
                    <BookOpen size={14} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  className="w-64 p-3 bg-gray-800 border-gray-700 text-gray-100 shadow-lg"
                >
                  <p className="text-xs font-medium text-gray-400 mb-2">Использованные источники:</p>
                  <ul className="space-y-1 list-disc list-inside marker:text-gray-500 text-xs">
                    {message.attachments.map((att, idx) => (
                      <li key={idx} className="pl-1 leading-relaxed">
                        {att.title}
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-gray-600 text-white">
            <User size={16} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}