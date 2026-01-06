import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, Calendar } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { SignedMediaUrl } from "@/components/SignedMediaUrl";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  milestone_date: string;
  media_url: string;
}

const TimelineCarousel = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    const { data, error } = await supabase
      .from("timeline_milestones")
      .select("*")
      .order("milestone_date", { ascending: true });

    if (!error && data) {
      setMilestones(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (milestones.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3 mb-8">
        <Heart className="h-6 w-6 text-primary fill-primary" />
        <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Nossa Timeline
        </h2>
        <Heart className="h-6 w-6 text-primary fill-primary" />
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {milestones.map((milestone) => (
            <CarouselItem key={milestone.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden romantic-glow">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <SignedMediaUrl
                    path={milestone.media_url}
                    mediaType="photo"
                    alt={milestone.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <CardContent className="p-4 relative">
                  <div className="flex items-center gap-2 text-secondary text-sm mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(milestone.milestone_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {milestone.title}
                  </h3>
                  {milestone.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {milestone.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Timeline dots */}
      <div className="flex justify-center mt-6 gap-2">
        {milestones.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-primary/30"
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineCarousel;
