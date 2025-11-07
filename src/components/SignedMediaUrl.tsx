import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignedMediaUrlProps {
  path: string;
  mediaType: string;
  alt?: string;
  className?: string;
}

export const SignedMediaUrl = ({ path, mediaType, alt, className }: SignedMediaUrlProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        const { data, error } = await supabase.storage
          .from("memories")
          .createSignedUrl(path, 3600); // URL válida por 1 hora

        if (error) throw error;
        setSignedUrl(data.signedUrl);
      } catch (error) {
        console.error("Error getting signed URL:", error);
      } finally {
        setLoading(false);
      }
    };

    getSignedUrl();
  }, [path]);

  if (loading) {
    return (
      <div className={`bg-muted animate-pulse ${className}`} />
    );
  }

  if (!signedUrl) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground">Erro ao carregar mídia</span>
      </div>
    );
  }

  if (mediaType === "photo") {
    return (
      <img
        src={signedUrl}
        alt={alt || "Memory"}
        className={className}
      />
    );
  }

  return (
    <video
      src={signedUrl}
      className={className}
      controls
      playsInline
      preload="metadata"
    />
  );
};
