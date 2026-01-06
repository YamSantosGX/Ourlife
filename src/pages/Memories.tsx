import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import PageBackground from "@/components/PageBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SignedMediaUrl } from "@/components/SignedMediaUrl";

interface Memory {
  id: string;
  media_url: string;
  media_type: string;
  special_date: string | null;
  description: string | null;
  created_at: string;
}

const Memories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMemories(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching memories:", error);
      }
      toast.error("Erro ao carregar memórias");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <PageBackground>
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary fill-primary animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Nossas Memórias
            </h1>
            <Heart className="h-8 w-8 text-primary fill-primary animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground italic">
            Momentos especiais que guardamos para sempre
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="h-80 bg-card border-border romantic-glow animate-pulse"
              />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground italic">
              Nenhuma memória cadastrada ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Faça login para adicionar suas primeiras memórias.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <Card
                key={memory.id}
                className="overflow-hidden bg-card border-border romantic-glow hover:scale-105 elegant-transition group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <SignedMediaUrl
                    path={memory.media_url}
                    mediaType={memory.media_type}
                    alt={memory.description || "Memory"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {(memory.special_date || memory.description) && (
                  <div className="p-4 space-y-2">
                    {memory.special_date && (
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(memory.special_date)}</span>
                      </div>
                    )}
                    {memory.description && (
                      <p className="text-sm text-muted-foreground italic">
                        {memory.description}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageBackground>
  );
};

export default Memories;
