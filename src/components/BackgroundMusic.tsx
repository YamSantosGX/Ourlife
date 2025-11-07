import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Volume suave
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      }
      setIsPlaying(!isPlaying);
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio
        ref={audioRef}
        loop
        muted={isMuted}
        src="https://cdn.pixabay.com/audio/2022/03/10/audio_4a8b348f72.mp3"
      />
      <Button
        onClick={toggleMute}
        variant="outline"
        size="icon"
        className="romantic-glow backdrop-blur-sm bg-background/80 border-primary/30 hover:bg-primary/20"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-primary" />
        ) : (
          <Volume2 className="h-5 w-5 text-primary" />
        )}
      </Button>
    </div>
  );
};

export default BackgroundMusic;
