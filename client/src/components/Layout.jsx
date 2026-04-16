import { useNavigate } from 'react-router-dom';
import Nav from './Nav';
import BackgroundLayer from './BackgroundLayer';
import { 
  Home, 
  Swords, 
  Users, 
  Trophy, 
  Brain 
} from 'lucide-react';

const BOTTOM_ITEMS = [
  { id: "dashboard", icon: Home, label: "Home" },
  { id: "quests",    icon: Swords, label: "Quests" },
  { id: "social",   icon: Users, label: "Social" },
  { id: "leaderboard", icon: Trophy, label: "Ranks" },
  { id: "tutor",    icon: Brain, label: "Tutor" },
];

export default function Layout({ 
  children, 
  activeNav, 
  setActiveNav, 
  userData, 
  currentUser, 
  selectedAvatar, 
  level, 
  onLogout, 
  onProfileClick, 
  onRefill, 
  socialNotification, 
  setSocialNotification,
  onStartBattle
}) {
  const navigate = useNavigate();

  const goTo = (id) => {
    if (id === 'dashboard') navigate(`/dashboard/${userData.username}`);
    else navigate(`/${id}`);
    if (id === 'social' && setSocialNotification) setSocialNotification(false);
    setActiveNav(id);
  };

  return (
    <div className="bg-[#050510] text-[#f8fafc] min-h-screen min-h-dvh">
      <BackgroundLayer />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Nav
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          userData={userData}
          currentUser={currentUser}
          selectedAvatar={selectedAvatar}
          level={level}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onRefill={onRefill}
          socialNotification={socialNotification}
          setSocialNotification={setSocialNotification}
          onStartBattle={onStartBattle}
        />

        {/* Page content — responsive padding */}
        <main
          className="flex-1 w-full mx-auto overflow-y-auto"
          style={{
            maxWidth: '1400px',
            padding: 'var(--page-padding-y) var(--page-padding-x)',
            paddingBottom: 'max(var(--page-padding-y), 5rem)'
          }}
        >
          {children}
        </main>

        {/* ─── Mobile Bottom Navigation Bar ──────────────────────────── */}
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {BOTTOM_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => goTo(id)}
              className={activeNav === id ? 'active' : ''}
              aria-label={label}
            >
              <span className="nav-icon"><Icon size={20} /></span>
              <span>{label}</span>
              {id === 'social' && socialNotification && (
                <span
                  className="absolute top-1 right-[calc(50%-10px)] w-2 h-2 bg-red-500 rounded-full animate-pulse"
                  style={{ position: 'absolute', top: '6px' }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

