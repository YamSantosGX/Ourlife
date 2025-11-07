import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const romanticQuotes = [
  "O amor não se vê com os olhos, mas com o coração.",
  "Em cada batida do meu coração, há um pedaço de você.",
  "Nosso amor é eterno como as estrelas no céu.",
  "Cada momento ao seu lado é um presente precioso.",
  "Você é a razão pela qual acredito no amor verdadeiro.",
  "Juntos somos mais fortes, juntos somos eternos.",
  "O amor que compartilhamos ilumina minha vida.",
  "Você é meu para sempre e sempre.",
  "Nosso amor é uma história sem fim.",
  "Com você, encontrei meu lar.",
  "O amor é a música que faz a vida dançar.",
  "Você é meu sonho mais lindo que se tornou realidade.",
  "Cada dia ao seu lado é uma nova página de felicidade.",
  "Nosso amor cresce como as flores na primavera.",
  "Você é a luz que guia meu caminho.",
  "Juntos escrevemos a mais bela das histórias.",
  "Meu coração bate no ritmo do seu amor.",
  "Você é minha inspiração, minha paz, meu tudo.",
  "O amor que sinto por você não conhece limites.",
  "Com você, descobri o significado da palavra eternidade.",
  "Nosso amor é uma chama que nunca se apaga.",
  "Você transformou minha vida em um conto de fadas.",
  "Cada abraço seu é um pedaço do paraíso.",
  "Nosso amor é a prova de que os milagres existem.",
  "Você é meu porto seguro em todos os momentos.",
];

const RomanticQuote = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * romanticQuotes.length);
    setQuote(romanticQuotes[randomIndex]);
  }, []);

  return (
    <div className="text-center py-8 border-t border-border/30">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Heart className="h-5 w-5 text-primary fill-primary animate-pulse" />
        <Heart className="h-4 w-4 text-secondary fill-secondary animate-pulse" style={{ animationDelay: "0.5s" }} />
        <Heart className="h-5 w-5 text-primary fill-primary animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      <p className="text-lg md:text-xl text-foreground/90 italic font-serif max-w-2xl mx-auto">
        "{quote}"
      </p>
    </div>
  );
};

export default RomanticQuote;
