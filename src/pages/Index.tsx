import Navigation from "@/components/Navigation";
import TimeCounter from "@/components/TimeCounter";
import MessageCarousel from "@/components/MessageCarousel";
import RomanticQuote from "@/components/RomanticQuote";
import heroImage from "@/assets/hero-romantic.jpg";
import { Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Romantic roses"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 px-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-primary fill-primary animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold text-foreground drop-shadow-lg">
                Nosso Tempo Juntos
              </h1>
              <Heart className="h-8 w-8 text-primary fill-primary animate-pulse" />
            </div>
            <p className="text-lg md:text-xl text-foreground/90 drop-shadow-md italic">
              Cada segundo é uma lembrança, cada minuto é uma história
            </p>
          </div>
        </div>
      </div>

      {/* Counter Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <TimeCounter />
      </section>

      {/* Messages Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mensagens do Coração
          </h2>
          <MessageCarousel />
        </div>
      </section>

      {/* Footer Quote */}
      <footer className="container mx-auto px-4 py-8">
        <RomanticQuote />
      </footer>
    </div>
  );
};

export default Index;
