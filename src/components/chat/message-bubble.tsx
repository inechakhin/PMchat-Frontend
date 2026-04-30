"use client";

import { Message } from "@/types/types";
import { cn } from "@/utils/cn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Copy, Check, BookOpen, FileText, Download } from "lucide-react";
import { AnimatedMarkdown } from "flowtoken";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  chatId: string;
}

export function MessageBubble({ message, isStreaming, chatId}: MessageBubbleProps) {
  const isUser = message.sender_type === "user";
  const [isCopied, setIsCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    const text = contentRef.current?.textContent?.trim() || message.text?.trim() || "";
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = (attachmentId: string) => {
    const downloadUrl = `/api/chats/${chatId}/attachment/${attachmentId}/download`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasSources = !isUser && message.sources.length > 0;
  const hasAttachments = !isUser && message.attachments.length > 0;

  return (
    <div className={cn("flex gap-3 group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-blue-600 text-white">
            <Bot size={16} />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-2 max-w-[85%]", isUser && "items-end")}>
        {/* Тело сообщения */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
            !isUser ? "bg-gray-800 text-gray-100 border border-gray-700" : "bg-blue-600 text-white"
          )}
        >
          <div ref={contentRef} className="prose prose-sm prose-invert max-w-none">
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

          {/* Список вложений (файлов) ВНУТРИ пузырька, если они есть */}
          {hasAttachments && (
            <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-gray-700/50">
              {message.attachments.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleDownload(file.id)}
                  className="flex items-center gap-3 p-2 bg-gray-900/40 hover:bg-gray-900/80 border border-gray-700 rounded-xl transition-all text-left group/file"
                >
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 group-hover/file:bg-blue-500 group-hover/file:text-white transition-colors">
                    <FileText size={18} />
                  </div>
                  <div className="flex flex-col pr-2 overflow-hidden">
                    <span className="text-xs font-medium truncate max-w-[150px]">{file.title}</span>
                    <span className="text-[10px] text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • Скачать
                    </span>
                  </div>
                  <Download size={14} className="text-gray-600 group-hover/file:text-gray-300 mr-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Панель инструментов под сообщением */}
        <div className="flex items-center gap-2 px-1">
          {/* Копирование */}
          {message.text && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-7 w-7 text-gray-500 hover:text-gray-300"
            >
              {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </Button>
          )}

          {/* Источники (Popover) */}
          {hasSources && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 gap-1.5 px-2 text-[11px] text-gray-500 hover:text-blue-400 transition-colors"
                >
                  <BookOpen size={13} />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="w-64 bg-gray-800 border-gray-700 p-3 shadow-xl">
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Использованные источники
                </h4>
                <div className="space-y-1.5">
                  {message.sources.map((src, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-gray-300 leading-relaxed">
                      <span className="text-gray-600">•</span>
                      {src.title}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-gray-700 text-white">
            <User size={16} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}