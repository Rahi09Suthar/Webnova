import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, LogOut, Bot, User as UserIcon, Loader2, Trash2, Home, MessageSquare, Shield, Settings, Info, Mail, Plus, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { User, Message } from '../types';
import { getBotResponse } from '../lib/gemini';

interface ChatPageProps {
  user: User;
  onLogout: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatPage({ user, onLogout, messages, setMessages }: ChatPageProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTopicIdx, setActiveTopicIdx] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: "Webnova Features Intro", timestamp: Date.now() - 172800000, date: "Apr 16", messages: [] },
      { id: '2', title: "Technical AI Discussion", timestamp: Date.now() - 86400000, date: "Apr 17", messages: [] }
    ];
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Smooth scroll to bottom with requestAnimationFrame for performance
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    };
    
    // Using a tiny timeout to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        setMessages([{
          id: 'welcome',
          text: `Welcome, ${user.name}! 👋 How can I assist you with your queries today?`,
          sender: 'bot',
          timestamp: Date.now()
        }]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const triggerSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Create history using the updated messages list
      // Note: we take all but the last message for history, 
      // as the last message is what we're sending now
      const history = updatedMessages.slice(0, -1).map(msg => ({
        role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: msg.text }]
      }));

      const botResponseText = await getBotResponse(text.trim(), history);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to get bot response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await triggerSendMessage(input);
    setInput('');
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-' + Date.now(),
      text: `Welcome, ${user.name}! 👋 Session cleared. How can I assist you further?`,
      sender: 'bot',
      timestamp: Date.now()
    }]);
    setActiveTopicIdx(null);
    setInput('');
  };

  const handleNewChat = () => {
    // Optionally save old chat to history before resetting
    if (messages.length > 2) {
      const newHistoryItem = {
        id: Date.now().toString(),
        title: messages[1]?.text?.slice(0, 30) || "Discussion " + (chatHistory.length + 1),
        timestamp: Date.now(),
        date: "Today",
        messages: [...messages]
      };
      setChatHistory((prev: any) => [newHistoryItem, ...prev]);
    }
    
    setMessages([{
      id: 'welcome-' + Date.now(),
      text: `Hello ${user.name}! 👋 Starting a brand new session. How can I help you?`,
      sender: 'bot',
      timestamp: Date.now()
    }]);
    setActiveTopicIdx(null);
    setInput('');
  };

  const openHistoryChat = (chat: any) => {
    console.log("Opening chat:", chat);
    if (chat.messages && chat.messages.length > 0) {
      setMessages([...chat.messages]);
    } else {
      // Mock data for static history items
      setMessages([
        { id: 'h-1-' + Date.now(), text: `Restore: ${chat.title}`, sender: 'bot', timestamp: chat.timestamp },
        { id: 'h-2-' + Date.now(), text: "This is a past conversation. Any new messages will be added to this thread.", sender: 'bot', timestamp: chat.timestamp + 1000 }
      ]);
    }
    setActiveTopicIdx(null);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory([]);
    localStorage.removeItem('chat_history');
  };

  const topics = [
    { title: "Webnova Features", query: "Can you tell me about the key features of Webnova?" },
    { title: "Support Portal", query: "Where can I find the support portal?" },
    { title: "Billing Inquiries", query: "How does billing work at Webnova?" },
    { title: "Technical AI", query: "What are some common technical questions?" },
    { title: "General Questions", query: "What else can you help me with?" }
  ];

  const historyChats = [
    { title: "Previous session 1", date: "Apr 15" },
    { title: "Billing query", date: "Apr 16" },
    { title: "Feature request", date: "Yesterday" }
  ];

  const handleTopicClick = async (idx: number) => {
    if (isTyping) return;
    setActiveTopicIdx(idx);
    await triggerSendMessage(topics[idx].query);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex overflow-hidden min-h-0 h-full w-full"
    >
      {/* Sidebar - Improved for layout stability */}
      <aside 
        className="hidden lg:flex w-72 bg-white/40 backdrop-blur-xl border-r border-white/10 flex-col shrink-0 z-20"
        aria-label="Sidebar navigation"
      >
        <div className="p-6 border-b border-black/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-lg border border-primary/20" aria-hidden="true">
            <Bot size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Webnova</h3>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">Robot AI Assistant</p>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all hover:bg-primary-hover active:scale-95"
            aria-label="Start a new chat"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>New Chat</span>
          </motion.button>
        </div>

        <div className="px-7 mb-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">History Chat</h4>
            <button 
              onClick={clearHistory}
              className="text-[9px] font-bold text-primary hover:text-red-500 transition-colors uppercase tracking-tighter"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 max-h-[150px] overflow-y-auto chat-scrollbar pr-1">
            {chatHistory.map((chat: any, i: number) => (
              <motion.div 
                key={chat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ x: 3 }}
                onClick={() => openHistoryChat(chat)}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/30 cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-300 group-hover:bg-primary transition-colors shrink-0" />
                  <span className="text-xs text-slate-600 group-hover:text-primary truncate">{chat.title}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium shrink-0">{chat.date}</span>
              </motion.div>
            ))}
            {chatHistory.length === 0 && (
              <p className="text-[10px] text-slate-400 italic text-center py-2">No history yet</p>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto chat-scrollbar" aria-label="Suggested topics">
          <div className="px-3 mb-2">
            <h4 id="topics-heading" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggested Topics</h4>
          </div>
          <div className="space-y-2" role="group" aria-labelledby="topics-heading">
            {topics.map((topic, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTopicClick(idx)}
                disabled={isTyping}
                aria-pressed={activeTopicIdx === idx}
                aria-label={`Ask about ${topic.title}`}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  activeTopicIdx === idx 
                  ? 'bg-white/60 border-indigo-200 text-primary font-semibold shadow-sm shadow-indigo-100' 
                  : 'bg-transparent border-transparent text-slate-600 hover:bg-white/40 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${activeTopicIdx === idx ? 'bg-primary text-white' : 'bg-black/5 text-slate-400'}`}>
                    <MessageSquare size={14} />
                  </div>
                  <span className="truncate">{topic.title}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-100 rounded-lg"
            aria-label="Logout"
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-transparent min-w-0 min-h-0 h-full overflow-hidden relative">
        {/* Header - Glass effect */}
        <header className="px-6 py-4 bg-white/40 backdrop-blur-xl border-b border-black/5 flex justify-between items-center shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-400 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shrink-0 border-2 border-white/50">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">Welcome, {user.name}!👋</h4>
              <p className="text-[11px] text-emerald-600 font-bold tracking-tight flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Online & Ready
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearChat}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50/20"
              title="Clear Conversation"
            >
              <Trash2 size={20} />
            </motion.button>
          </div>
        </header>

        {/* Chat Window - Immersive scrolling */}
        <section 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth min-h-0 chat-scrollbar flex flex-col z-0"
          aria-label="Message history"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.23, 1, 0.32, 1]
                }}
                className={`flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                aria-label={`Message from ${msg.sender === 'user' ? 'you' : 'AI assistant'}`}
              >
                <div className={`flex items-end gap-3 w-full ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar Icons */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                    msg.sender === 'user' 
                    ? 'bg-slate-200 text-slate-600' 
                    : 'bg-primary text-white'
                  }`}>
                    {msg.sender === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                  </div>

                  <div className={`
                    max-w-[85%] sm:max-w-[80%] px-5 py-3.5 text-sm leading-relaxed shadow-xl relative group/msg
                    ${msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-[22px] rounded-br-[4px] shadow-purple-200' 
                      : 'bg-white/90 backdrop-blur-md text-slate-800 border border-purple-100 rounded-[22px] rounded-bl-[4px] shadow-black/5'}
                  `}>
                    <div className={`prose prose-sm max-w-none ${msg.sender === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    {msg.sender === 'bot' && (
                      <button 
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="absolute right-3 bottom-2 p-1.5 rounded-lg opacity-0 group-hover/msg:opacity-100 transition-all hover:bg-black/5 text-slate-400 hover:text-primary active:scale-90"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium px-2" aria-label={`Sent at ${new Date(msg.timestamp).toLocaleTimeString()}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-start gap-3 items-end"
                aria-label="Bot is typing"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot size={16} />
                </div>
                <div className="bg-white/90 backdrop-blur-md border border-purple-100 px-5 py-4 rounded-[22px] rounded-bl-[4px] flex items-center gap-2 shadow-xl shadow-black/5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ 
                          y: [0, -6, 0],
                          backgroundColor: ["#cbd5e1", "#6366f1", "#cbd5e1"]
                        }}
                        transition={{ 
                          duration: 0.8, 
                          repeat: Infinity, 
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                        className="w-1.5 h-1.5 rounded-full"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="sr-only">Typing...</span>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Input Area - Floats at bottom */}
        <div className="p-6 bg-gradient-to-t from-white/10 to-transparent backdrop-blur-sm border-t border-black/5 shrink-0">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={handleSend} 
              className="flex gap-3 items-center"
              aria-label="Message composition"
            >
              <motion.div 
                className="flex-1 relative"
                whileFocus={{ scale: 1.01 }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Webnova something..."
                  disabled={isTyping}
                  aria-label="Message into"
                  aria-disabled={isTyping}
                  className="w-full px-6 py-4 bg-white/60 border border-purple-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400 disabled:opacity-60 shadow-xl backdrop-blur-md"
                />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label={isTyping ? "AI is processing response" : "Send message"}
                className={`
                  h-[52px] px-8 rounded-2xl font-bold text-sm transition-all flex items-center justify-center min-w-[140px]
                  ${!input.trim() || isTyping 
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                    : 'bg-primary hover:bg-primary-hover text-white shadow-xl shadow-primary/20'}
                `}
              >
                {isTyping ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : (
                  <div className="flex items-center gap-2">
                    <span>Send</span>
                    <Send size={16} aria-hidden="true" />
                  </div>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Themed Footer */}
        <footer className="px-6 py-3.5 text-[10px] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 uppercase tracking-wider font-bold bg-primary backdrop-blur-md shrink-0 text-white">
          <div className="flex items-center gap-1.5">
            <span className="text-white/60">© 2026</span>
            <span>Built by <strong className="text-white">Rahi Suthar</strong></span>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="https://www.linkedin.com/in/rahi-suthar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <Info size={12} />
              <span>linkedin : Rahi Suthar</span>
            </a>
          </div>
        </footer>
      </main>
    </motion.div>
  );
}
