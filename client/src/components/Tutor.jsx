import { useState, useRef, useEffect } from 'react';
import { sendMessageToTutor } from '../api';
import { 
  Bot, 
  Sparkles, 
  SendHorizonal, 
  Zap, 
  Brain, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';

const QUICK_QUESTIONS = [
  "Explain JavaScript closures",
  "How does CSS Flexbox work?",
  "Tips for improving vocabulary",
  "What is a DataFrame?",
];

export default function Tutor({ userData }) {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Greetings, brave learner! I am Sage, your AI tutor. Ask me anything about your quests, topics, or learning journey!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setMessages(prev => [...prev, { role: "bot", content: "...", isLoading: true }]);

    try {
      // Map internal 'bot' role to 'assistant' for the backend to process
      const apiMessages = messages
        .filter(m => !m.isLoading)
        .slice(-10) // Increase history context window
        .map(m => ({
          role: m.role === "bot" ? "assistant" : "user",
          content: m.content,
        }))
        .concat({ role: "user", content: userMsg });

      const data = await sendMessageToTutor(apiMessages, {
        username: userData.username || "learner",
        xp: userData.xp,
        level: userData.level,
      });

      // Update with the actual reply
      setMessages(prev => prev.filter(m => !m.isLoading).concat({ 
        role: "bot", 
        content: data.reply 
      }));
    } catch (err) {
      console.error("Tutor Error:", err);
      // Display the specific error message from the backend if available
      const errorText = err.message || "My magical connection flickered. Please try again!";
      setMessages(prev => prev.filter(m => !m.isLoading).concat({ 
        role: "bot", 
        content: errorText 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-title text-2xl font-bold mb-1 flex items-center gap-2">
          AI Tutor — Sage <Bot className="text-accent2" size={24} />
        </h2>
        <p className="text-text2 text-sm">Your personal guide through every learning challenge.</p>
      </div>

      <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl" style={{ height: 'calc(100vh - 180px)', maxHeight: '650px' }}>
        {/* Tutor Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 bg-surface2/30">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white shadow-lg shadow-accent/20">
            <Brain size={24} />
          </div>
          <div>
            <div className="font-title text-sm font-bold text-white tracking-tight">Sage — AI Tutor</div>
            <div className="text-[10px] text-green-400 font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online & available
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 no-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed animate-msg-in flex gap-3 ${
              msg.role === 'user' 
              ? 'bg-gradient-to-r from-accent to-accent2 text-white self-end rounded-br-none shadow-lg shadow-accent/10' 
              : 'bg-surface2 text-text1 self-start rounded-bl-none border border-white/5'
            }`}>
              {msg.role === 'bot' && !msg.isLoading && <Bot size={16} className="shrink-0 mt-0.5 opacity-50" />}
              <div>
                {msg.isLoading ? (
                  <div className="flex items-center gap-2 italic text-text3">
                    <Sparkles size={14} className="animate-pulse" /> Sage is thinking...
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Quick Questions */}
        <div className="px-5 pb-4 flex gap-2 flex-wrap">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="bg-bg2/50 border border-white/10 rounded-xl px-4 py-1.5 text-[10px] text-text3 font-black uppercase tracking-widest hover:border-accent2 hover:text-accent2 hover:bg-accent2/5 transition-all duration-300">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 pb-5 flex gap-3 border-t border-white/10 pt-4 bg-surface2/20">
          <div className="flex-1 relative group">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-text3 group-focus-within:text-accent transition-colors" size={18} />
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask Sage anything..."
              className="w-full pl-12 pr-4 py-3 bg-bg2 border border-white/5 rounded-2xl text-text1 text-sm outline-none focus:border-accent2 focus:ring-4 focus:ring-accent/5 transition-all font-bold placeholder:text-text3/50" 
            />
          </div>
          <button 
            onClick={send} 
            disabled={loading || !input.trim()}
            className="w-12 h-12 flex items-center justify-center bg-accent hover:bg-accent2 shadow-lg shadow-accent/20 disabled:opacity-30 disabled:pointer-events-none rounded-2xl text-white transition-all active:scale-95"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <SendHorizonal size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

