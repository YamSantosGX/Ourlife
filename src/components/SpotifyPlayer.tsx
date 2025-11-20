import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const SpotifyPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([30]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-xl border-t border-border/50 z-50">
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/audio/2022/03/10/audio_4a8b348f72.mp3"
      />
      
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Album Art & Song Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center romantic-glow flex-shrink-0">
              <span className="text-2xl">🎵</span>
            </div>
            <div className="min-w-0 hidden sm:block">
              <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                Romantic Waltz
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                Nosso Amor
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                onClick={() => {}}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hidden md:flex"
              >
                <SkipBack className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="icon"
                className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary hover:bg-primary/90 romantic-glow"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground fill-primary-foreground" />
                ) : (
                  <Play className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground fill-primary-foreground ml-0.5" />
                )}
              </Button>

              <Button
                onClick={() => {}}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hidden md:flex"
              >
                <SkipForward className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleProgressChange}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-end">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10"
            >
              {isMuted || volume[0] === 0 ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Slider
              value={volume}
              max={100}
              step={1}
              onValueChange={setVolume}
              className="w-24"
            />
          </div>

          {/* Mobile Volume Toggle */}
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 lg:hidden flex-shrink-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
