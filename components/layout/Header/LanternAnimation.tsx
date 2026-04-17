export default function CNYAnimation() {
  // Simple Chinese Lantern Component
  const ChineseLantern = ({ id }: { id: number }) => {
    const left = (id % 6) * 16 + 8;
    const delay = id * 0.3;
    const swingDuration = 5 + id * 0.2;
    
    return (
      <div
        className="absolute top-4 pointer-events-none"
        style={{
          left: `${left}%`,
          animation: `lanternSwing ${swingDuration}s ease-in-out ${delay}s infinite alternate`,
          transformOrigin: 'top center',
          zIndex: 40,
        }}
      >
        {/* Lantern string */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-yellow-300 to-yellow-500"
          style={{
            width: '1px',
            height: '35px',
          }}
        />
        
        {/* Lantern body */}
        <div
          className="absolute top-8 rounded-md bg-gradient-to-b from-red-500 to-red-700"
          style={{
            width: '20px',
            height: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 12px rgba(255, 0, 0, 0.6)',
          }}
        >
          {/* Gold decorative band */}
          <div className="absolute top-1.5 left-1 right-1 h-0.5 bg-yellow-400 rounded-full"></div>
          <div className="absolute bottom-1.5 left-1 right-1 h-0.5 bg-yellow-400 rounded-full"></div>
          
          {/* Simple Chinese character */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-yellow-300 text-xs font-bold">福</span>
          </div>
        </div>
      </div>
    );
  };

  // Simple Angpao Component
  const Angpao = ({ id }: { id: number }) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = 15 + Math.random() * 10;
    
    return (
      <div
        className="absolute top-0 pointer-events-none"
        style={{
          left: `${left}%`,
          animation: `angpaoFloat ${duration}s linear ${delay}s infinite`,
          zIndex: 35,
          opacity: 0.8,
        }}
      >
        <div className="relative w-5 h-7 rounded-sm bg-gradient-to-b from-red-500 to-red-600 shadow-md">
          {/* Gold line */}
          <div className="absolute top-1/2 left-1 right-1 h-0.5 bg-yellow-400 transform -translate-y-1/2"></div>
          
          {/* Simple character */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-yellow-300 text-[8px] font-bold">囍</span>
          </div>
          
          {/* Twinkle effect */}
          <div 
            className="absolute inset-0 rounded-sm"
            style={{
              animation: `twinkle 2s ease-in-out ${Math.random() * 2}s infinite alternate`,
            }}
          />
        </div>
      </div>
    );
  };

  // Simple Firework Component
  const Firework = ({ id }: { id: number }) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 5 + 2;
    const color = id % 3 === 0 ? 'red' : id % 3 === 1 ? 'yellow' : 'orange';
    
    const colors = {
      red: ['#ff6b6b', '#ff9f9f'],
      yellow: ['#ffd93d', '#fff9a6'],
      orange: ['#ff9f43', '#ffcc8a']
    };
    
    const [primary, secondary] = colors[color];
    
    return (
      <div
        className="absolute bottom-0 pointer-events-none"
        style={{
          left: `${left}%`,
          animation: `fireworkLaunch 3s ease-out ${delay}s infinite`,
          zIndex: 50,
        }}
      >
        {/* Launch trail */}
        <div
          className="absolute bg-gradient-to-t from-yellow-500 to-transparent"
          style={{
            width: '2px',
            height: '80px',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
        
        {/* Main burst */}
        <div
          className="absolute rounded-full"
          style={{
            width: '40px',
            height: '40px',
            left: '50%',
            top: '-100px',
            transform: 'translateX(-50%)',
            background: `radial-gradient(circle, ${secondary}, ${primary})`,
            animation: `fireworkBurst 1.2s ease-out ${delay + 1.5}s infinite`,
            opacity: 0,
            boxShadow: `0 0 20px ${primary}`,
          }}
        />
        
        {/* Simple burst particles */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: '3px',
              height: '3px',
              left: '50%',
              top: '-100px',
              background: primary,
              animation: `burstParticle${i} 1.2s ease-out ${delay + 1.5}s infinite`,
              opacity: 0,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Lanterns - Simple and minimal */}
      {Array.from({ length: 6 }).map((_, i) => (
        <ChineseLantern key={`lantern-${i}`} id={i} />
      ))}
      
      {/* Angpao - Simple floating */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Angpao key={`angpao-${i}`} id={i} />
      ))}
      
      {/* Fireworks - Simple but visible */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Firework key={`firework-${i}`} id={i} />
      ))}
      
      <style jsx>{`
        @keyframes lanternSwing {
          0% {
            transform: rotate(-8deg);
          }
          50% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(8deg);
          }
        }
        
        @keyframes angpaoFloat {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
            transform: translateY(20vh) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) rotate(180deg);
            opacity: 0.8;
          }
          85% {
            opacity: 0.9;
            transform: translateY(80vh) rotate(270deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.7;
            box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
          }
        }
        
        @keyframes fireworkLaunch {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120px);
            opacity: 0;
          }
        }
        
        @keyframes fireworkBurst {
          0% {
            transform: translateX(-50%) scale(0);
            opacity: 0;
          }
          30% {
            transform: translateX(-50%) scale(1.2);
            opacity: 0.9;
          }
          70% {
            transform: translateX(-50%) scale(0.9);
            opacity: 0.7;
          }
          100% {
            transform: translateX(-50%) scale(0);
            opacity: 0;
          }
        }
        
        /* Simple particle animations */
        @keyframes burstParticle0 { /* Right */ 
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          30% { transform: translate(60px, 0) scale(1); opacity: 0.8; }
          100% { transform: translate(80px, 0) scale(0); opacity: 0; }
        }
        @keyframes burstParticle1 { /* Right-Up */ 
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          30% { transform: translate(42px, -42px) scale(1); opacity: 0.8; }
          100% { transform: translate(56px, -56px) scale(0); opacity: 0; }
        }
        @keyframes burstParticle2 { /* Up */ 
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          30% { transform: translate(0, -60px) scale(1); opacity: 0.8; }
          100% { transform: translate(0, -80px) scale(0); opacity: 0; }
        }
        @keyframes burstParticle3 { /* Left-Up */ 
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          30% { transform: translate(-42px, -42px) scale(1); opacity: 0.8; }
          100% { transform: translate(-56px, -56px) scale(0); opacity: 0; }
        }
        @keyframes burstParticle4 { /* Left */ 
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          30% { transform: translate(-60px, 0) scale(1); opacity: 0.8; }
          100% { transform: translate(-80px, 0) scale(0); opacity: 0; }
        }
        @keyframes burstParticle5 { /* Left-Down */ 
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          30% { transform: translate(-42px, 42px) scale(1); opacity: 0.8; }
          100% { transform: translate(-56px, 56px) scale(0); opacity: 0; }
        }
        @keyframes burstParticle6 { /* Down */ 
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          30% { transform: translate(0, 60px) scale(1); opacity: 0.8; }
          100% { transform: translate(0, 80px) scale(0); opacity: 0; }
        }
        @keyframes burstParticle7 { /* Right-Down */ 
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          30% { transform: translate(42px, 42px) scale(1); opacity: 0.8; }
          100% { transform: translate(56px, 56px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}