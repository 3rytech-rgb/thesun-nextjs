import React, { useState, useEffect } from 'react';

interface CountdownBannerProps {
  targetDate: Date;
  backgroundImage?: string;
  backgroundColor?: string;
  link?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const difference = targetDate.getTime() - new Date().getTime();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const pad = (num: number): string => num.toString().padStart(2, '0');

export const CountdownBanner: React.FC<CountdownBannerProps> = ({
  targetDate,
  backgroundImage,
  backgroundColor = '#1a1a2e',
  link = '#',
}) => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div
        className="relative w-full h-[200px] bg-cover bg-center"
        style={{
          backgroundColor,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
    );
  }

  const boxClass = 'flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg min-w-[100px] py-4 px-5 border border-white/10';

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:opacity-95 transition-opacity"
    >
      <div
        className="relative w-full h-[200px] flex items-center justify-center bg-center"
        style={{
          backgroundColor,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 flex items-center gap-4 md:gap-6">
          <div className={boxClass}>
            <span className="text-3xl md:text-5xl font-bold text-white">{pad(timeLeft.days)}</span>
            <span className="text-xs md:text-sm text-white/60 uppercase tracking-wider mt-1">Days</span>
          </div>
          <div className={boxClass}>
            <span className="text-3xl md:text-5xl font-bold text-white">{pad(timeLeft.hours)}</span>
            <span className="text-xs md:text-sm text-white/60 uppercase tracking-wider mt-1">Hours</span>
          </div>
          <div className={boxClass}>
            <span className="text-3xl md:text-5xl font-bold text-white">{pad(timeLeft.minutes)}</span>
            <span className="text-xs md:text-sm text-white/60 uppercase tracking-wider mt-1">Mins</span>
          </div>
          <div className={boxClass}>
            <span className="text-3xl md:text-5xl font-bold text-white">{pad(timeLeft.seconds)}</span>
            <span className="text-xs md:text-sm text-white/60 uppercase tracking-wider mt-1">Secs</span>
          </div>
        </div>
      </div>
    </a>
  );
};
