import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, LogOut, Upload, Calendar } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Message {
  id: string;
  message_date: string;
  message_text: string;
}

interface Memory {
  id: string;
  media_url: string;
  media_type: string;
  special_date: string | null;
  description: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  // Message form
  const [messageDate, setMessageDate] = useState("");
  const [messageText, setMessageText] = useState("");

  // Memory form
  const [uploading, setUploading] = useState(false);
  const [memoryFile, setMemoryFile] = useState<File | null>(null);
  const [memoryDate, setMemoryDate] = useState("");
  const [memoryDescription, setMemoryDescription] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);
    setLoading(false);
    fetchMessages();
    fetchMemories();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("monthly_messages")
      .select("*")
      .order("message_date", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar mensagens");
      return;
    }

    setMessages(data || []);
  };

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar memórias");
      return;
    }

    setMemories(data || []);
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("monthly_messages").insert({
      message_date: messageDate,
      message_text: messageText,
    });

    if (error) {
      toast.error("Erro ao adicionar mensagem");
      return;
    }

    toast.success("Mensagem adicionada com sucesso!");
    setMessageDate("");
    setMessageText("");
    fetchMessages();
  };

  const handleDeleteMessage = async (id: string) => {
    const { error } = await supabase
      .from("monthly_messages")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao deletar mensagem");
      return;
    }

    toast.success("Mensagem deletada!");
    fetchMessages();
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memoryFile) {
      toast.error("Selecione um arquivo");
      return;
    }

    setUploading(true);

    try {
      const fileExt = memoryFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(filePath, memoryFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("memories")
        .getPublicUrl(filePath);

      const mediaType = memoryFile.type.startsWith("video/") ? "video" : "photo";

      const { error: insertError } = await supabase.from("memories").insert({
        media_url: publicUrl,
        media_type: mediaType,
        special_date: memoryDate || null,
        description: memoryDescription || null,
      });

      if (insertError) throw insertError;

      toast.success("Memória adicionada com sucesso!");
      setMemoryFile(null);
      setMemoryDate("");
      setMemoryDescription("");
      fetchMemories();
    } catch (error) {
      console.error("Error uploading memory:", error);
      toast.error("Erro ao adicionar memória");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMemory = async (memory: Memory) => {
    try {
      const fileName = memory.media_url.split("/").pop();
      
      if (fileName) {
        await supabase.storage.from("memories").remove([fileName]);
      }

      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("id", memory.id);

      if (error) throw error;

      toast.success("Memória deletada!");
      fetchMemories();
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error("Erro ao deletar memória");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Painel Admin
          </h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="memories">Memórias</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-6">
            <Card className="bg-card border-border romantic-glow">
              <CardHeader>
                <CardTitle>Adicionar Nova Mensagem</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="messageDate">Data (dia 06 do mês)</Label>
                    <Input
                      id="messageDate"
                      type="date"
                      value={messageDate}
                      onChange={(e) => setMessageDate(e.target.value)}
                      required
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messageText">Mensagem</Label>
                    <Textarea
                      id="messageText"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      required
                      rows={4}
                      placeholder="Escreva sua mensagem romântica..."
                      className="bg-input border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Adicionar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Mensagens Cadastradas</h2>
              {messages.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma mensagem cadastrada.</p>
              ) : (
                <div className="grid gap-4">
                  {messages.map((message) => (
                    <Card key={message.id} className="bg-card border-border">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-secondary mb-2">
                              {new Date(message.message_date).toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-foreground italic">"{message.message_text}"</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="memories" className="space-y-6">
            <Card className="bg-card border-border romantic-glow">
              <CardHeader>
                <CardTitle>Adicionar Nova Memória</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMemory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memoryFile">Foto ou Vídeo</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="memoryFile"
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => setMemoryFile(e.target.files?.[0] || null)}
                        required
                        className="bg-input border-border"
                      />
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memoryDate">Data Especial (opcional)</Label>
                    <Input
                      id="memoryDate"
                      type="date"
                      value={memoryDate}
                      onChange={(e) => setMemoryDate(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memoryDescription">Descrição (opcional)</Label>
                    <Textarea
                      id="memoryDescription"
                      value={memoryDescription}
                      onChange={(e) => setMemoryDescription(e.target.value)}
                      rows={3}
                      placeholder="Descreva esta memória..."
                      className="bg-input border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? "Enviando..." : "Adicionar Memória"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Memórias Cadastradas</h2>
              {memories.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma memória cadastrada.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memories.map((memory) => (
                    <Card key={memory.id} className="overflow-hidden bg-card border-border">
                      <div className="relative aspect-square">
                        {memory.media_type === "photo" ? (
                          <img
                            src={memory.media_url}
                            alt={memory.description || "Memory"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={memory.media_url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>
                      <CardContent className="pt-4 space-y-2">
                        {memory.special_date && (
                          <div className="flex items-center gap-2 text-sm text-secondary">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(memory.special_date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        )}
                        {memory.description && (
                          <p className="text-sm text-muted-foreground">{memory.description}</p>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDeleteMemory(memory)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
