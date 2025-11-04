import { useEffect, useState } from "react";

interface TimeUnits {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TimeCounter = () => {
  const [timeElapsed, setTimeElapsed] = useState<TimeUnits>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const startDate = new Date("2023-09-06T00:00:00");

    const calculateTime = () => {
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let remainingDays = now.getDate() - startDate.getDate();

      if (remainingDays < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        remainingDays += prevMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      setTimeElapsed({
        years,
        months,
        days: remainingDays,
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center bg-card border border-border rounded-lg p-4 md:p-6 romantic-glow elegant-transition hover:scale-105">
      <span className="text-3xl md:text-5xl font-bold text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mt-2">
        {label}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 max-w-4xl mx-auto">
      <TimeUnit value={timeElapsed.years} label="Anos" />
      <TimeUnit value={timeElapsed.months} label="Meses" />
      <TimeUnit value={timeElapsed.days} label="Dias" />
      <TimeUnit value={timeElapsed.hours} label="Horas" />
      <TimeUnit value={timeElapsed.minutes} label="Minutos" />
      <TimeUnit value={timeElapsed.seconds} label="Segundos" />
    </div>
  );
};

export default TimeCounter;
