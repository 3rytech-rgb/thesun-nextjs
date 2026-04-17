// components/layout/Header/rayaanimation.tsx
'use client';

import { useEffect, useState } from 'react';

interface RayaAnimationProps {
  isActive?: boolean;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  particles: Array<{
    angle: number;
    distance: number;
    size: number;
  }>;
  phase: 'rise' | 'burst';
  progress: number;
}

interface DuitRaya {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  speed: number;
  opacity: number;
}

export default function RayaAnimation({ isActive = true }: RayaAnimationProps) {
  const [time, setTime] = useState(0);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [duitRayas, setDuitRayas] = useState<DuitRaya[]>([]);

  useEffect(() => {
    if (!isActive) return;

    let animationFrame: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      setTime(prev => prev + delta);
      
      // Update fireworks - burst in center
      setFireworks(prev => {
        const updated = prev.map(fw => ({
          ...fw,
          progress: fw.progress + delta * (fw.phase === 'rise' ? 2.5 : 2),
          particles: fw.phase === 'burst' 
            ? fw.particles.map(p => ({ ...p, distance: p.distance + delta * 100 }))
            : fw.particles,
        })).filter(fw => fw.progress < 2.5);
        
        return updated;
      });
      
      // Update duit raya - fall and fade
      setDuitRayas(prev => 
        prev
          .map(d => ({
            ...d,
            y: d.y + d.speed * delta * 60,
            rotation: d.rotation + delta * 50,
            opacity: d.y > 70 ? Math.max(0, d.opacity - delta * 2) : d.opacity,
          }))
          .filter(d => d.opacity > 0 && d.y < 110)
      );
      
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    // Spawn fireworks more frequently
    const fireworkInterval = setInterval(() => {
      if (fireworks.length < 6) {
        const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316', '#06b6d4'];
        const newFirework: Firework = {
          id: Date.now(),
          x: 30 + Math.random() * 40, // Center area: 30-70%
          y: 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          particles: Array.from({ length: 20 }, (_, i) => ({
            angle: (i * 18) * (Math.PI / 180),
            distance: 0,
            size: 2 + Math.random() * 3,
          })),
          phase: 'rise',
          progress: 0,
        };
        setFireworks(prev => [...prev, newFirework]);
        
        // Trigger burst quicker
        setTimeout(() => {
          setFireworks(prev => prev.map(fw => 
            fw.id === newFirework.id ? { ...fw, phase: 'burst' } : fw
          ));
        }, 600);
      }
    }, 1500);

    // Spawn duit raya
    const duitRayaInterval = setInterval(() => {
      if (duitRayas.length < 15) {
        const newDuit: DuitRaya = {
          id: Date.now() + Math.random(),
          x: 5 + Math.random() * 90,
          y: -5,
          rotation: Math.random() * 360,
          scale: 0.6 + Math.random() * 0.4,
          speed: 0.8 + Math.random() * 0.8,
          opacity: 1,
        };
        setDuitRayas(prev => [...prev, newDuit]);
      }
    }, 800);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(fireworkInterval);
      clearInterval(duitRayaInterval);
    };
  }, [isActive, fireworks.length, duitRayas.length]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 15 }}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-transparent to-amber-900/8"></div>

      {/* Bulan Sabit - Longer Crescent Moon */}
      <div 
        className="absolute"
        style={{
          right: '6%',
          top: '8%',
          animation: 'moonSway 5s ease-in-out infinite',
          transformOrigin: 'top right',
        }}
      >
        <div className="relative">
           {/* String - longer */}
          <div className="absolute -top-24 right-6 w-px h-24 bg-gradient-to-b from-transparent via-yellow-400/30 to-yellow-400/50"></div>
          
          {/* Hanging Star - swings with moon */}
          <div 
            className="absolute -top-8 right-10"
            style={{
              animation: 'starSwing 3s ease-in-out infinite',
              animationDelay: '0.5s',
            }}
          >
            <div className="relative">
              {/* Star string */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-transparent via-yellow-300/40 to-yellow-300/60"></div>
              
              {/* Star */}
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-200 transform rotate-45 rounded-sm"></div>
                <div className="absolute inset-0.5 bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-100 transform rotate-45 rounded-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-amber-300 rounded-full"></div>
                </div>
                {/* Glow */}
                <div className="absolute -inset-1 rounded-sm bg-yellow-300/20 blur-sm"></div>
              </div>
            </div>
          </div>
          
          {/* Moon - larger */}
          <div className="relative w-24 h-24">
            {/* Outer glow */}
            <div 
              className="absolute -inset-10 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(253,224,71,0.12) 0%, transparent 70%)',
              }}
            />
            
            {/* Inner glow */}
            <div 
              className="absolute -inset-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(253,224,71,0.08) 0%, transparent 60%)',
              }}
            />
            
            {/* Crescent shape */}
            <div className="relative w-full h-full">
              {/* Full moon base */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-200 rounded-full shadow-2xl">
                {/* Craters */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-200/60 rounded-full"></div>
                <div className="absolute top-10 right-5 w-4 h-4 bg-yellow-200/50 rounded-full"></div>
                <div className="absolute bottom-5 left-7 w-2 h-2 bg-yellow-200/40 rounded-full"></div>
                <div className="absolute top-16 left-6 w-2.5 h-2.5 bg-yellow-200/35 rounded-full"></div>
              </div>
              
              {/* Shadow to create crescent - larger */}
              <div 
                className="absolute bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-full"
                style={{
                  width: '65%',
                  height: '65%',
                  top: '17%',
                  right: '-12%',
                }}
              />
            </div>
            
            {/* Stars around moon */}
            <div className="absolute -top-3 -left-5 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-6 -left-8 w-1 h-1 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -bottom-2 -right-5 w-1 h-1 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            <div className="absolute top-12 -left-6 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }}></div>
            <div className="absolute top-3 -right-3 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }}></div>
          </div>
        </div>
      </div>

      {/* Fireworks - Burst in center */}
      {fireworks.map(fw => {
        if (fw.phase === 'rise') {
          const y = 100 - (fw.progress * 50);
          return (
            <div
              key={fw.id}
              className="absolute"
              style={{
                left: `${fw.x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Rising trail */}
              <div 
                className="absolute w-1 h-6 -top-4 left-1/2 -translate-x-1/2"
                style={{
                  background: `linear-gradient(to top, transparent, ${fw.color}40)`,
                }}
              />
              {/* Rising spark */}
              <div 
                className="relative"
                style={{
                  width: '6px',
                  height: '6px',
                  background: fw.color,
                  borderRadius: '50%',
                  boxShadow: `0 0 10px ${fw.color}, 0 0 20px ${fw.color}50`,
                }}
              />
            </div>
          );
        } else {
          // Burst phase - in center
          return (
            <div key={fw.id}>
              {fw.particles.map((p, i) => {
                const x = fw.x + Math.cos(p.angle) * p.distance * 0.4;
                const y = 50 + Math.sin(p.angle) * p.distance * 0.3;
                const opacity = Math.max(0, 1 - p.distance / 120);
                
                return (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      background: fw.color,
                      boxShadow: `0 0 ${p.size * 3}px ${fw.color}`,
                      opacity,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                );
              })}
              {/* Center flash */}
              <div 
                className="absolute rounded-full"
                style={{
                  left: `${fw.x}%`,
                  top: '50%',
                  width: '20px',
                  height: '20px',
                  background: `radial-gradient(circle, ${fw.color}80 0%, transparent 70%)`,
                  transform: 'translate(-50%, -50%)',
                  opacity: Math.max(0, 0.8 - fw.progress * 0.4),
                }}
              />
            </div>
          );
        }
      })}

      {/* Duit Raya - Falling money packets */}
      {duitRayas.map(duit => (
        <div
          key={duit.id}
          className="absolute"
          style={{
            left: `${duit.x}%`,
            top: `${duit.y}%`,
            transform: `translate(-50%, -50%) rotate(${duit.rotation}deg) scale(${duit.scale})`,
            opacity: duit.opacity,
            transition: 'opacity 0.3s ease-out',
          }}
        >
          <div className="relative w-8 h-10">
            {/* Envelope */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-lg shadow-lg">
              {/* Border pattern */}
              <div className="absolute inset-1 border border-yellow-300/40 rounded-md"></div>
              
              {/* Inner pattern */}
              <div className="absolute inset-2 border border-yellow-200/20 rounded-sm"></div>
              
              {/* RM text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[6px] font-bold text-yellow-300/90">RM</div>
                </div>
              </div>
            </div>
            
            {/* Seal on top */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <div className="w-3 h-3 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full shadow-md">
                <div className="absolute inset-0.5 border border-rose-300/30 rounded-full"></div>
              </div>
            </div>
            
            {/* Glow effect */}
            <div 
              className="absolute -inset-1 rounded-lg"
              style={{
                background: 'radial-gradient(circle, rgba(74,222,128,0.2) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>
      ))}

      {/* Pelitas - Oil Lamps */}
      {[0, 1, 2, 3, 4].map(i => {
        const x = 12 + i * 19;
        const flicker = Math.sin(time * 6 + i * 1.5) * 0.15;
        const flicker2 = Math.sin(time * 10 + i * 2) * 0.1;
        
        return (
          <div
            key={`pelita-${i}`}
            className="absolute"
            style={{
              left: `${x}%`,
              bottom: '8%',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="relative w-8 h-10">
              {/* Base */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-5 bg-gradient-to-t from-amber-900 to-amber-800 rounded-t-xl">
                <div className="absolute top-1 left-1 right-1 h-0.5 bg-amber-700/40 rounded-full"></div>
              </div>
              
              {/* Oil */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-5 h-2 bg-amber-500/60 rounded-full"></div>
              
              {/* Flame */}
              <div 
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: '16px',
                  width: '8px',
                  height: `${16 + flicker * 8}px`,
                }}
              >
                {/* Glow */}
                <div 
                  className="absolute -inset-6 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(255,180,80,${0.25 + flicker2 * 0.1}) 0%, transparent 70%)`,
                  }}
                />
                
                {/* Flame */}
                <div 
                  className="relative w-full h-full"
                  style={{
                    background: `linear-gradient(to top, #f59e0b 0%, #fbbf24 30%, #fef3c7 60%, #fffbeb 100%)`,
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    transform: `scaleX(${0.85 + flicker * 0.2})`,
                    boxShadow: `0 0 12px rgba(251,191,36,0.6)`,
                  }}
                >
                  <div 
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-white/90"
                    style={{ opacity: 0.7 + flicker2 * 0.2 }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Ketupats */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const x = 8 + i * 16;
        const y = 20 + Math.sin(time * 0.5 + i) * 5;
        const rotate = Math.sin(time * 0.3 + i * 0.5) * 8;
        
        return (
          <div
            key={`ketupat-${i}`}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
              opacity: 0.4,
            }}
          >
            <div className="relative w-12 h-14">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-lg transform rotate-45 scale-70">
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  {[0, 1, 2, 3, 4].map(j => (
                    <div 
                      key={j}
                      className="absolute left-0 right-0 h-px bg-green-700/20"
                      style={{ top: `${20 + j * 15}%` }}
                    />
                  ))}
                  {[0, 1, 2, 3].map(j => (
                    <div 
                      key={j}
                      className="absolute top-0 bottom-0 w-px bg-green-700/20"
                      style={{ left: `${25 + j * 12.5}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
                <div className="w-2.5 h-2.5 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Sparkles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const sparkle = Math.sin(time * 4 + i * 2);
        return (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-300/40 rounded-full"
            style={{
              left: `${10 + i * 11}%`,
              top: `${15 + Math.sin(time * 2 + i) * 10}%`,
              opacity: 0.3 + sparkle * 0.3,
              transform: `scale(${1 + sparkle * 0.3})`,
            }}
          />
        );
      })}

       {/* CSS Animations */}
      <style jsx>{`
        @keyframes moonSway {
          0%, 100% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(4deg);
          }
        }
        
        @keyframes starSwing {
          0%, 100% {
            transform: rotate(-8deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }
      `}</style>
    </div>
  );
}