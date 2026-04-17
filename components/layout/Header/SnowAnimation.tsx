export default function SnowAnimation() {
  const Snowflake = ({ id }: { id: number }) => {
    const size = Math.random() * 5 + 3;
    const left = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = Math.random() * 3 + 5;
    
    return (
      <div
        className="absolute top-0 rounded-full bg-white opacity-80 pointer-events-none"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animation: `fall ${duration}s linear ${delay}s infinite`,
          filter: 'blur(0.5px)'
        }}
      />
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <Snowflake key={i} id={i} />
      ))}
      
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}