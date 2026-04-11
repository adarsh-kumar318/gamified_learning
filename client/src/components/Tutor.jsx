import { useState, useRef, useEffect } from 'react';
import { sendMessageToTutor } from '../api';

const QUICK_QUESTIONS = [
  "Explain JavaScript closures",
  "How does CSS Flexbox work?",
  "Tips for improving vocabulary",
  "What is a DataFrame?",
];

export default function Tutor({ userData }) {
  const [messages, setMessages] = useState([
    { role: "bot", content: "⚡ Greetings, brave learner! I am Sage, your AI tutor. Ask me anything about your quests, topics, or learning journey!" }
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
      const apiMessages = messages.filter(m => !m.isLoading).slice(-6).map(m => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      })).concat({ role: "user", content: userMsg });

      const data = await sendMessageToTutor(apiMessages, {
        username: userData.username || "learner",
        xp: userData.xp,
        level: userData.level,
      });
      setMessages(prev => prev.filter(m => !m.isLoading).concat({ role: "bot", content: data.reply }));
    } catch {
      setMessages(prev => prev.filter(m => !m.isLoading).concat({ role: "bot", content: "⚡ My magical connection flickered. Please try again!" }));
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-title text-2xl font-bold mb-1">AI Tutor — Sage</h2>
        <p className="text-text2 text-sm">Your personal guide through every learning challenge.</p>
      </div>

      <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)', maxHeight: '650px' }}>
        {/* Tutor Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-lg">🧠</div>
          <div>
            <div className="font-title text-sm font-semibold">Sage — AI Tutor</div>
            <div className="text-xs text-green2">● Online & ready to help</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed animate-msg-in ${msg.role === 'user' ? 'bg-gradient-to-r from-accent to-accent2 text-white self-end rounded-br-sm' : 'bg-surface2 text-text1 self-start rounded-bl-sm'} ${msg.isLoading ? 'italic text-text2' : ''}`}>
              {msg.isLoading ? "✨ Sage is thinking..." : msg.content}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Quick Questions */}
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="bg-bg2 border border-white/10 rounded-full px-3 py-1 text-xs text-text2 hover:border-accent2 hover:text-accent2 transition-all duration-200 font-body">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 flex gap-3 border-t border-white/10 pt-3">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask Sage anything..."
            className="flex-1 px-4 py-2.5 bg-bg2 border border-white/10 rounded-xl text-text1 text-sm outline-none focus:border-accent2 transition-colors font-body placeholder:text-text3" />
          <button onClick={send} disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-accent hover:bg-accent2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold text-sm transition-colors">
            {loading ? "..." : "Send ⚡"}
          </button>
        </div>
      </div>
    </div>
  );
}
