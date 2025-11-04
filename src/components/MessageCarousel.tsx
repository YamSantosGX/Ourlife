import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  message_date: string;
  message_text: string;
}

const MessageCarousel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("monthly_messages")
        .select("*")
        .order("message_date", { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : messages.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < messages.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 romantic-glow animate-pulse">
        <div className="h-32 bg-muted rounded"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 romantic-glow text-center">
        <p className="text-muted-foreground italic">
          Nenhuma mensagem cadastrada ainda.
        </p>
      </div>
    );
  }

  const currentMessage = messages[currentIndex];
  const messageDate = new Date(currentMessage.message_date);

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8 romantic-glow relative">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="shrink-0 hover:bg-primary/20 hover:text-primary elegant-transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex-1 text-center space-y-4">
          <p className="text-sm text-secondary font-semibold">
            {messageDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-lg md:text-xl text-foreground leading-relaxed italic">
            "{currentMessage.message_text}"
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="shrink-0 hover:bg-primary/20 hover:text-primary elegant-transition"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default MessageCarousel;
