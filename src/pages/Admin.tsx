import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PageBackground from "@/components/PageBackground";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, LogOut, Upload, Calendar, MoreVertical, Pencil } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SignedMediaUrl } from "@/components/SignedMediaUrl";

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

interface Milestone {
  id: string;
  title: string | null;
  media_url: string;
}

interface PartnerMessage {
  id: string;
  message_date: string;
  message_text: string;
}

// Validation schemas
const messageSchema = z.object({
  message_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  message_text: z.string().min(1, "Mensagem não pode estar vazia").max(5000, "Mensagem muito longa (máximo 5000 caracteres)"),
});

const memorySchema = z.object({
  description: z.string().max(1000, "Descrição muito longa (máximo 1000 caracteres)").optional(),
  special_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida").optional().or(z.literal("")),
});

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerMessages, setPartnerMessages] = useState<PartnerMessage[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Message form
  const [messageDate, setMessageDate] = useState("");
  const [messageText, setMessageText] = useState("");

  // Memory form
  const [uploading, setUploading] = useState(false);
  const [memoryFile, setMemoryFile] = useState<File | null>(null);
  const [memoryDate, setMemoryDate] = useState("");
  const [memoryDescription, setMemoryDescription] = useState("");

  // Edit message dialog
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMessageDate, setEditMessageDate] = useState("");
  const [editMessageText, setEditMessageText] = useState("");

  // Timeline form
  const [milestoneFile, setMilestoneFile] = useState<File | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState("");

  // Partner message form
  const [partnerMessageDate, setPartnerMessageDate] = useState("");
  const [partnerMessageText, setPartnerMessageText] = useState("");
  const [uploadingMilestone, setUploadingMilestone] = useState(false);

  // Relationship settings
  const [relationshipStartDate, setRelationshipStartDate] = useState("");

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
    fetchPartnerMessages();
    fetchMemories();
    fetchMilestones();
    fetchRelationshipSettings();
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

  const fetchPartnerMessages = async () => {
    const { data, error } = await supabase
      .from("partner_messages")
      .select("*")
      .order("message_date", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar mensagens dela");
      return;
    }

    setPartnerMessages(data || []);
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

  const fetchMilestones = async () => {
    const { data, error } = await supabase
      .from("timeline_milestones")
      .select("id, title, media_url")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar marcos da timeline");
      return;
    }

    setMilestones(data || []);
  };

  const handleAddPartnerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      messageSchema.parse({
        message_date: partnerMessageDate,
        message_text: partnerMessageText,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    const { error } = await supabase.from("partner_messages").insert({
      message_date: partnerMessageDate,
      message_text: partnerMessageText,
      user_id: user.id,
    });

    if (error) {
      toast.error("Erro ao adicionar mensagem dela");
      return;
    }

    toast.success("Mensagem dela adicionada com sucesso!");
    setPartnerMessageDate("");
    setPartnerMessageText("");
    fetchPartnerMessages();
  };

  const handleDeletePartnerMessage = async (id: string) => {
    const { error } = await supabase
      .from("partner_messages")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao deletar mensagem");
      return;
    }

    toast.success("Mensagem deletada!");
    fetchPartnerMessages();
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate inputs
    try {
      messageSchema.parse({
        message_date: messageDate,
        message_text: messageText,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    const { error } = await supabase.from("monthly_messages").insert({
      message_date: messageDate,
      message_text: messageText,
      user_id: user.id,
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

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setEditMessageDate(message.message_date);
    setEditMessageText(message.message_text);
    setEditDialogOpen(true);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage || !editMessageDate || !editMessageText) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Validate inputs
    try {
      messageSchema.parse({
        message_date: editMessageDate,
        message_text: editMessageText,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    const { error } = await supabase
      .from("monthly_messages")
      .update({
        message_date: editMessageDate,
        message_text: editMessageText,
      })
      .eq("id", editingMessage.id);

    if (error) {
      toast.error("Erro ao atualizar mensagem");
      return;
    }

    toast.success("Mensagem atualizada com sucesso!");
    setEditDialogOpen(false);
    setEditingMessage(null);
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
    
    if (!memoryFile || !user) {
      toast.error("Selecione um arquivo");
      return;
    }

    // Validate file size
    if (memoryFile.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande (máximo 50MB)");
      return;
    }

    // Validate inputs
    try {
      memorySchema.parse({
        description: memoryDescription,
        special_date: memoryDate,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setUploading(true);

    try {
      const fileExt = memoryFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(filePath, memoryFile);

      if (uploadError) throw uploadError;

      const mediaType = memoryFile.type.startsWith("video/") ? "video" : "photo";

      const { error: insertError } = await supabase.from("memories").insert({
        media_url: filePath,
        media_type: mediaType,
        special_date: memoryDate || null,
        description: memoryDescription || null,
        user_id: user.id,
      });

      if (insertError) throw insertError;

      toast.success("Memória adicionada com sucesso!");
      setMemoryFile(null);
      setMemoryDate("");
      setMemoryDescription("");
      fetchMemories();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error uploading memory:", error);
      }
      toast.error("Erro ao adicionar memória");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMemory = async (memory: Memory) => {
    try {
      await supabase.storage.from("memories").remove([memory.media_url]);

      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("id", memory.id);

      if (error) throw error;

      toast.success("Memória deletada!");
      fetchMemories();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error deleting memory:", error);
      }
      toast.error("Erro ao deletar memória");
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!milestoneFile || !user) {
      toast.error("Selecione uma imagem");
      return;
    }

    if (milestoneFile.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande (máximo 50MB)");
      return;
    }

    setUploadingMilestone(true);

    try {
      const fileExt = milestoneFile.name.split(".").pop();
      const fileName = `milestone_${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(filePath, milestoneFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("timeline_milestones").insert({
        title: milestoneTitle || null,
        media_url: filePath,
        user_id: user.id,
      });

      if (insertError) throw insertError;

      toast.success("Marco adicionado com sucesso!");
      setMilestoneFile(null);
      setMilestoneTitle("");
      fetchMilestones();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error uploading milestone:", error);
      }
      toast.error("Erro ao adicionar marco");
    } finally {
      setUploadingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestone: Milestone) => {
    try {
      await supabase.storage.from("memories").remove([milestone.media_url]);

      const { error } = await supabase
        .from("timeline_milestones")
        .delete()
        .eq("id", milestone.id);

      if (error) throw error;

      toast.success("Marco deletado!");
      fetchMilestones();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error deleting milestone:", error);
      }
      toast.error("Erro ao deletar marco");
    }
  };

  const fetchRelationshipSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("relationship_settings")
        .select("start_date")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        const date = new Date(data.start_date);
        setRelationshipStartDate(date.toISOString().split("T")[0]);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching relationship settings:", error);
      }
    }
  };

  const handleSaveRelationshipDate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !relationshipStartDate) {
      toast.error("Por favor, selecione uma data");
      return;
    }

    try {
      const { error } = await supabase
        .from("relationship_settings")
        .upsert({
          user_id: user.id,
          start_date: new Date(relationshipStartDate).toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      toast.success("Data salva com sucesso!");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error saving relationship date:", error);
      }
      toast.error("Erro ao salvar data");
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
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
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="memories">Memórias</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-6">
            {/* Minhas mensagens */}
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

            {/* Mensagens dela */}
            <Card className="bg-card border-border romantic-glow">
              <CardHeader>
                <CardTitle>Adicionar Mensagem Dela</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPartnerMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="partnerMessageDate">Data</Label>
                    <Input
                      id="partnerMessageDate"
                      type="date"
                      value={partnerMessageDate}
                      onChange={(e) => setPartnerMessageDate(e.target.value)}
                      required
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerMessageText">Mensagem</Label>
                    <Textarea
                      id="partnerMessageText"
                      value={partnerMessageText}
                      onChange={(e) => setPartnerMessageText(e.target.value)}
                      required
                      rows={4}
                      placeholder="Escreva a mensagem que você recebeu..."
                      className="bg-input border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="secondary">
                    Adicionar Mensagem Dela
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Minhas mensagens cadastradas */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Minhas Mensagens</h2>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditMessage(message)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Mensagens dela cadastradas */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Mensagens Dela</h2>
              {partnerMessages.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma mensagem dela cadastrada.</p>
              ) : (
                <div className="grid gap-4">
                  {partnerMessages.map((message) => (
                    <Card key={message.id} className="bg-card border-border border-l-4 border-l-secondary">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-secondary mb-2">
                              {new Date(message.message_date).toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-foreground italic">"{message.message_text}"</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePartnerMessage(message.id)}
                            className="text-destructive hover:text-destructive"
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
                        <SignedMediaUrl
                          path={memory.media_url}
                          mediaType={memory.media_type}
                          alt={memory.description || "Memory"}
                          className="w-full h-full object-cover"
                        />
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

          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-card border-border romantic-glow">
              <CardHeader>
                <CardTitle>Adicionar Marco da Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMilestone} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="milestoneFile">Imagem (formato 9:16 recomendado) *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="milestoneFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setMilestoneFile(e.target.files?.[0] || null)}
                        required
                        className="bg-input border-border"
                      />
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestoneTitle">Título (opcional)</Label>
                    <Input
                      id="milestoneTitle"
                      value={milestoneTitle}
                      onChange={(e) => setMilestoneTitle(e.target.value)}
                      placeholder="Ex: Primeiro beijo"
                      className="bg-input border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={uploadingMilestone}>
                    {uploadingMilestone ? "Enviando..." : "Adicionar Marco"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Marcos Cadastrados</h2>
              {milestones.length === 0 ? (
                <p className="text-muted-foreground">Nenhum marco cadastrado.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {milestones.map((milestone) => (
                    <Card key={milestone.id} className="overflow-hidden bg-card border-border">
                      <div className="relative aspect-[9/16]">
                        <SignedMediaUrl
                          path={milestone.media_url}
                          mediaType="photo"
                          alt={milestone.title || "Timeline"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="pt-4 space-y-2">
                        {milestone.title && (
                          <h3 className="font-semibold text-foreground text-sm">{milestone.title}</h3>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDeleteMilestone(milestone)}
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

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card border-border romantic-glow">
              <CardHeader>
                <CardTitle>Data de Início do Relacionamento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveRelationshipDate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="relationshipDate">
                      Adicione a data de início do seu relacionamento:
                    </Label>
                    <Input
                      id="relationshipDate"
                      type="date"
                      value={relationshipStartDate}
                      onChange={(e) => setRelationshipStartDate(e.target.value)}
                      required
                      className="bg-input border-border"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Salvar Data
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mensagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editMessageDate">Data</Label>
              <Input
                id="editMessageDate"
                type="date"
                value={editMessageDate}
                onChange={(e) => setEditMessageDate(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMessageText">Mensagem</Label>
              <Textarea
                id="editMessageText"
                value={editMessageText}
                onChange={(e) => setEditMessageText(e.target.value)}
                rows={4}
                className="bg-input border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateMessage}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageBackground>
  );
};

export default Admin;
