'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WCPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <Link
        href="/wcpage"
        className="group relative block"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        <div className="relative flex items-center gap-3 bg-gradient-to-br from-red-800 via-red-900 to-black rounded-2xl px-5 py-3.5 border border-red-500/30 group-hover:border-red-400/50 transition-all duration-500 shadow-2xl group-hover:shadow-red-900/50">
          <div className="relative">
            <span className="text-xl">🏆</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] leading-tight">World Cup</span>
            <span className="text-red-400 font-black text-sm tracking-wider">2026</span>
          </div>
          <div className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center group-hover:bg-red-500/30 group-hover:border-red-400/50 transition-all duration-300 group-hover:translate-x-0.5">
            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full px-2 py-0.5 text-[7px] font-black text-white uppercase tracking-widest shadow-lg animate-pulse">
          Live
        </div>
      </Link>
      <style jsx>{`
        .group {
          animation: wcCardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
          transform-origin: bottom right;
        }
        @keyframes wcCardIn {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.85) rotate(-3deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
