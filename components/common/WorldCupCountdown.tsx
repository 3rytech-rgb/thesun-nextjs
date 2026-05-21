'use client';

import { useState, useEffect } from 'react';

export default function WorldCupCountdown() {
  const target = new Date('2026-06-11T00:00:00').getTime();
  const [now, setNow] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - (mounted ? now : target));
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <span className="text-white font-bold text-[10px] uppercase tracking-widest">World Cup 2026 Countdown</span>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Days', value: d },
              { label: 'Hours', value: h },
              { label: 'Minutes', value: m },
              { label: 'Seconds', value: s },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                  <span className="text-sm font-black text-white tabular-nums">{String(value).padStart(2, '0')}</span>
                </div>
                <span className="text-[7px] text-white/80 mt-0.5 uppercase tracking-widest font-bold">{label}</span>
              </div>
            ))}
          </div>
          <span className="text-white/80 text-[9px] uppercase tracking-wider font-medium whitespace-nowrap">11 June 2026</span>
        </div>
      </div>
    </div>
  );
}
