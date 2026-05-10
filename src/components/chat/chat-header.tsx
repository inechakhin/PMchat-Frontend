import { useChatStore } from "@/store/chat-store";

interface ChatHeaderProps {
  chatId?: string;
}

export function ChatHeader({ chatId }: ChatHeaderProps) {
  const { chats } = useChatStore();
  
  const currentChat = chats.find((c) => c.id === chatId);

  if (!chatId || !currentChat) return null;

  return (
    <div className="border-b px-6 py-1.5 bg-white dark:bg-gray-950 dark:border-gray-800">
      <h1 className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none">
        {currentChat.title}
      </h1>
      <p className="text-xs text-gray-500 mt-1">
        {currentChat.type === "generation" ? "Генерация" : "Общение"}
      </p>
    </div>
  );
}