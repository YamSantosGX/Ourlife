import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [startDate, setStartDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchStartDate = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("relationship_settings")
          .select("start_date")
          .eq("user_id", user.id)
          .single();

        if (data && !error) {
          setStartDate(new Date(data.start_date));
        }
      }
    };

    fetchStartDate();
  }, []);

  useEffect(() => {
    if (!startDate) return;

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
  }, [startDate]);

  if (!startDate) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Configure a data de início do relacionamento no painel Admin
        </p>
      </div>
    );
  }

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
