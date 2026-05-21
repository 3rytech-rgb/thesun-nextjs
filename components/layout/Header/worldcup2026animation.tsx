'use client';

import { useEffect, useState } from 'react';

interface WorldCup2026AnimationProps {
  isActive?: boolean;
}

interface FallingObject {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  opacity: number;
  type: 'ball' | 'trophy';
  sway: number;
  swaySpeed: number;
}

export default function WorldCup2026Animation({ isActive = true }: WorldCup2026AnimationProps) {
  const [falling, setFalling] = useState<FallingObject[]>([]);

  useEffect(() => {
    if (!isActive) return;

    let animationFrame: number;
    let lastTime = 0;
    let time = 0;

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      time += delta;

      setFalling(prev =>
        prev
          .map(o => ({
            ...o,
            y: o.y + o.speed * delta * 60,
            x: o.x + Math.sin(time * o.swaySpeed + o.sway) * 0.3,
            rotation: o.rotation + delta * (o.type === 'trophy' ? 30 : 80),
            opacity: o.y > 100 ? Math.max(0, o.opacity - delta * 3) : o.opacity,
          }))
          .filter(o => o.opacity > 0)
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    const spawnInterval = setInterval(() => {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        if (falling.length < 15) {
          const isTrophy = Math.random() < 0.08;
          const newObj: FallingObject = {
            id: Date.now() + Math.random(),
            x: Math.random() * 100,
            y: -15,
            size: isTrophy ? 28 + Math.random() * 12 : 8 + Math.random() * 10,
            speed: isTrophy ? 1 + Math.random() * 0.8 : 1.2 + Math.random() * 1.2,
            rotation: Math.random() * 360,
            opacity: 0.6 + Math.random() * 0.2,
            type: isTrophy ? 'trophy' : 'ball',
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.2 + Math.random() * 0.4,
          };
          setFalling(prev => [...prev, newObj]);
        }
      }
    }, 1200);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(spawnInterval);
    };
  }, [isActive, falling.length]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 15 }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/30 to-transparent"></div>

      {/* Falling objects */}
      {falling.map(obj => (
        <div
          key={obj.id}
          className="absolute"
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            transform: `translate(-50%, -50%) rotate(${obj.rotation}deg)`,
            opacity: obj.opacity,
          }}
        >
          {obj.type === 'trophy' ? (
            <img
              src="/images/trophy.png"
              alt="Trophy"
              style={{
                width: `${obj.size}px`,
                height: 'auto',
                filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.5))',
              }}
            />
          ) : (
            <div
              className="relative"
              style={{
                width: `${obj.size}px`,
                height: `${obj.size}px`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-full shadow-lg border border-gray-300">
                <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full opacity-40">
                  <path d="M20 4 L28 12 L26 22 L14 22 L12 12 Z" fill="#333" />
                  <path d="M20 36 L28 28 L26 18 L14 18 L12 28 Z" fill="#333" />
                  <path d="M4 16 L12 12 L20 16 L16 24 L8 24 Z" fill="#333" />
                  <path d="M36 16 L28 12 L20 16 L24 24 L32 24 Z" fill="#333" />
                </svg>
              </div>
              <div
                className="absolute -inset-3 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
