import { useState } from 'react';
import { login, register } from '../api';
import { 
  Swords, 
  Shield, 
  ScrollText, 
  Gem, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react';

export default function Auth({ onLogin }) {
  const [authTab, setAuthTab] = useState("login");
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (authTab === 'login') {
        res = await login(formData.username, formData.password);
      } else {
        res = await register(formData.username, formData.email, formData.password);
      }
      
      if (res.user && res.token) {
        onLogin(res.user, res.token);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a1a]">
      <div className="w-full max-w-sm relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="text-accent2 mb-4 drop-shadow-[0_0_30px_rgba(124,58,237,0.8)] animate-bounce-alt inline-block">
            <Swords size={72} />
          </div>
          <h1 className="font-title text-4xl font-bold text-gradient-purple tracking-tight">LevelUp Learning</h1>
          <div className="h-1 w-20 bg-accent mx-auto mt-2 rounded-full opacity-50"></div>
          <p className="text-text2 text-[10px] mt-3 tracking-[5px] uppercase font-bold opacity-70">Your quest begins now</p>
        </div>

        {/* Auth Glass Card */}
        <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(124,58,237,0.1)]">
          
          {/* Tab Switcher */}
          <div className="flex p-1 bg-bg/50 rounded-2xl border border-white/5 mb-8">
            {["login", "signup"].map(tab => (
              <button 
                key={tab} 
                onClick={() => { setAuthTab(tab); setError(''); }}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-xl ${authTab === tab ? 'bg-gradient-to-r from-accent to-accent2 text-white shadow-lg shadow-accent/20' : 'text-text3 hover:text-text2'}`}
              >
                {tab === "login" ? "Login" : "Join Guild"}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 animate-shake">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text3 uppercase tracking-widest ml-1">Username</label>
              <input 
                type="text" 
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Hero Name"
                className="w-full h-12 px-4 bg-bg/50 border border-white/5 rounded-xl text-white placeholder:text-text3/50 focus:border-accent2/50 focus:ring-4 focus:ring-accent/10 transition-all outline-none text-sm font-bold"
              />
            </div>

            {authTab === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text3 uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="messenger@kingdom.com"
                  className="w-full h-12 px-4 bg-bg/50 border border-white/5 rounded-xl text-white placeholder:text-text3/50 focus:border-accent2/50 focus:ring-4 focus:ring-accent/10 transition-all outline-none text-sm font-bold"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text3 uppercase tracking-widest ml-1">Secret Key</label>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-12 px-4 bg-bg/50 border border-white/5 rounded-xl text-white placeholder:text-text3/50 focus:border-accent2/50 focus:ring-4 focus:ring-accent/10 transition-all outline-none text-sm font-bold"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-accent to-accent2 hover:from-accent2 hover:to-accent text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20 hover:shadow-accent/40 active:scale-95 transition-all duration-300 transform group disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  {authTab === 'login' ? 'ENTER KINGDOM' : 'START QUEST'}
                  <Swords size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-text3 text-[10px] font-medium tracking-tight uppercase opacity-50">
            {authTab === 'login' ? "Forgotten your scroll? Contact the Wizard Guild." : "By joining, you agree to the Covenant of Heroes."}
          </p>
        </div>

        {/* Footer Decorative */}
        <div className="mt-10 flex justify-center gap-8 opacity-20 group">
          <span className="hover:opacity-100 cursor-default transition-all duration-500 hover:text-accent"><Shield size={24} /></span>
          <span className="hover:opacity-100 cursor-default transition-all duration-500 hover:text-accent2"><ScrollText size={24} /></span>
          <span className="hover:opacity-100 cursor-default transition-all duration-500 hover:text-gold"><Gem size={24} /></span>
        </div>
      </div>
    </div>
  );
}

