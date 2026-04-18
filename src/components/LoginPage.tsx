import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserCircle2, ArrowRight, Bot } from 'lucide-react';

interface LoginPageProps {
  onLogin: (name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex items-center justify-center p-6 min-h-full relative overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-purple-900/10 p-8 border border-white relative z-10"
      >
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 overflow-hidden shadow-2xl shadow-indigo-500/10 border-2 border-primary/20 relative group">
                <div className="absolute inset-0 bg-primary/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                <Bot size={56} className="text-primary relative z-10" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome to Webnova</h1>
              <p className="text-slate-500 text-sm">Built to understand you, designed to help with everything you need</p>
            </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          aria-label="Login form"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              autoFocus
              aria-required="true"
              className="w-full px-4 py-3 bg-white border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            aria-label="Start chatting with Webnova"
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
          >
            Start Chatting
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

