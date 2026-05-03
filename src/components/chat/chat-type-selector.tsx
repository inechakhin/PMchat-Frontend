import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";

interface ChatTypeSelectorProps {
  currentType: "communication" | "generation";
  onTypeChange: (type: "communication" | "generation") => void;
}

export function ChatTypeSelector({ currentType, onTypeChange }: ChatTypeSelectorProps) {
  return (
    <div className="flex gap-3 my-6">
      <Button
        variant={currentType === "communication" ? "primary" : "outline"}
        size="lg"
        className="rounded-full shadow-sm"
        onClick={() => onTypeChange("communication")}
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        Общение
      </Button>
      
      <Button
        variant={currentType === "generation" ? "primary" : "outline"}
        size="lg"
        className="rounded-full shadow-sm"
        onClick={() => onTypeChange("generation")}
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Генерация
      </Button>
    </div>
  );
}