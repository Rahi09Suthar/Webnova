import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useVelocity, useAnimationFrame, useTransform } from 'motion/react';
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage';
import { User, Message } from './types';

function InteractiveWaveLine({ index }: { index: number }) {
  const baseTime = useRef(Math.random() * 1000);
  const pos = useMotionValue(0);
  
  useAnimationFrame((_, delta) => {
    // Increased speed for dynamic bidirectional and vertical motion
    const speed = 0.0006; 
    baseTime.current += delta * speed;
    pos.set(baseTime.current);
  });

  // Balanced spacing for the threads
  const startX = (index * 17) + 8; 
  
  const x = useTransform(pos, (t) => {
    // Bidirectional drift: alternating lines move horizontally in opposite directions
    const direction = index % 2 === 0 ? 1 : -1;
    const drift = Math.sin(t + index * 0.7) * 6 * direction; 
    return (startX + drift) + "%";
  });

  // Vertical movement: the wave pattern propagates vertically
  const y = useTransform(pos, (t) => {
    // Correct modulo (1000) to match the wave repeat cycle for seamless looping
    const verticalOffset = (t * 250) % 1000;
    return `-${verticalOffset}px`;
  });
  
  const opacity = useTransform(pos, (t) => 0.2 + Math.sin(t * 0.3 + index) * 0.05);

  // SVG Sine Wave path - repeating pattern for seamless vertical propagation
  // We make it double-length so it can slide up/down without showing gaps
  const wavePath = "M 50 0 Q 100 250 50 500 Q 0 750 50 1000 Q 100 1250 50 1500 Q 0 1750 50 2000";

  return (
    <motion.div
      className="absolute top-0 w-[400px] pointer-events-none z-0"
      style={{
        left: x,
        y,
        opacity,
        translateX: "-50%",
        height: "2000px" // Extended height for the propagating pattern
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 2000" preserveAspectRatio="none">
        <path
          d={wavePath}
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          className="text-slate-900/40"
        />
      </svg>
    </motion.div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const savedName = localStorage.getItem('chat_user_name');
    if (savedName) {
      setUser({ name: savedName });
    }
  }, []);

  const handleLogin = (name: string) => {
    localStorage.setItem('chat_user_name', name);
    setUser({ name });
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_user_name');
    setUser(null);
    setMessages([]);
  };

  return (
    <div className={`h-screen w-screen overflow-hidden relative transition-colors duration-1000 ${!user ? 'bg-[#EEF1FF]' : 'bg-slate-50'}`}>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 vibrant-bg overflow-hidden" aria-hidden="true">
        {/* Light overlay for readability */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10" />
        
        {/* Animated Shooting Stars/Lines */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute bg-gradient-to-r from-transparent via-purple-300/40 to-transparent blur-[1px] z-0"
            initial={{ 
              top: Math.random() * 100 + "%",
              left: "-10%",
              width: "300px",
              height: "2px",
              opacity: 0,
              rotate: -35
            }}
            animate={{ 
              left: "110%",
              opacity: [0, 0.4, 0.6, 0.4, 0],
            }}
            transition={{ 
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          />
        ))}

        {/* Slow Gliding Light Beams */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`beam-${i}`}
            className="absolute bg-gradient-to-b from-transparent via-purple-200/30 to-transparent z-0"
            initial={{ 
              top: "-20%",
              left: Math.random() * 100 + "%",
              width: "2px",
              height: "140%",
              opacity: 0,
              rotate: 15
            }}
            animate={{ 
              left: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
              opacity: [0, 0.1, 0.3, 0.1, 0],
            }}
            transition={{ 
              duration: 25 + Math.random() * 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Animated Particles/Stars */}
        {[...Array(50)].map((_, i) => {
          const type = i % 3;
          const size = type === 0 ? "w-0.5 h-0.5" : type === 1 ? "w-1 h-1" : "w-1.5 h-1.5";
          const color = i % 4 === 0 ? "bg-purple-200" : i % 4 === 1 ? "bg-pink-200" : i % 4 === 2 ? "bg-indigo-200" : "bg-white";
          const glow = type === 0 ? "shadow-[0_0_8px_rgba(168,85,247,0.4)]" : "shadow-none";
          const duration = 15 + Math.random() * 25;
          
          return (
            <motion.div
              key={`particle-${i}`}
              className={`absolute ${size} ${color} rounded-full ${glow} blur-[0.5px] z-0`}
              initial={{ 
                opacity: 0,
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                opacity: [0, 0.4, 0.7, 0.4, 0],
                x: [
                  `${Math.random() * 100}%`, 
                  `${Math.random() * 100}%`, 
                  `${Math.random() * 100}%`
                ],
                y: [
                  `${Math.random() * 100}%`, 
                  `${Math.random() * 100}%`, 
                  `${Math.random() * 100}%`
                ],
                scale: type === 0 ? [1, 1.4, 1] : [1, 1.2, 1]
              }}
              transition={{ 
                duration: duration, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: Math.random() * -duration 
              }}
            />
          );
        })}

        {/* Larger Atmospheric Blobs - Softened for the video effect */}
        <motion.div 
          animate={{ x: [0, 80, 0], y: [0, -40, 0], rotate: [0, 90, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-indigo-200/20 blur-[120px] rounded-full z-0"
        />
        <motion.div 
          animate={{ x: [0, -60, 0], y: [0, 100, 0], rotate: [0, -120, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-64 -right-64 w-[700px] h-[700px] bg-purple-200/20 blur-[150px] rounded-full z-0"
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-100/10 blur-[180px] rounded-full z-0"
        />

        {/* Login Page Specific Motion - Sine wave threads from video */}
        <AnimatePresence>
          {!user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            >
              {[...Array(6)].map((_, i) => (
                <InteractiveWaveLine key={`wave-${i}`} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full h-full flex flex-col relative overflow-hidden z-10">
        <main className="flex-1 flex flex-col relative overflow-hidden min-h-0 h-full">
          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0"
              >
                <LoginPage onLogin={handleLogin} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0 h-full w-full"
              >
                <ChatPage 
                  user={user} 
                  onLogout={handleLogout} 
                  messages={messages} 
                  setMessages={setMessages} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}


