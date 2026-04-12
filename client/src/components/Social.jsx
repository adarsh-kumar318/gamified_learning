import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchFriendsList, 
  fetchPendingRequests, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest,
  searchUsersToFriend
} from '../api';
import { AVATARS } from '../constants/data';
import { 
  Users, 
  UserPlus, 
  Search, 
  Swords, 
  Handshake, 
  Shield, 
  ScrollText, 
  User, 
  Check, 
  X, 
  BellRing,
  CircleX
} from 'lucide-react';

export default function Social({ userData, socket }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const searchTimeout = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, rData] = await Promise.all([
        fetchFriendsList(),
        fetchPendingRequests()
      ]);
      setFriends(fData);
      setRequests(rData);
    } catch (err) {
      console.error('Failed to load social data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    if (socket) {
      socket.on('new_friend_request', (senderData) => {
        setRequests(prev => [...prev, { senderId: senderData, status: 'pending', _id: Date.now().toString() }]);
        showMessage(`New friend request from ${senderData.username}!`, <BellRing size={16} />);
      });

      socket.on('friend_request_accepted', (receiverData) => {
        setFriends(prev => [...prev, receiverData]);
        showMessage(`${receiverData.username} accepted your request!`, <Handshake size={16} />);
      });

      socket.on('user_status_change', ({ userId, status }) => {
        setFriends(prev => prev.map(f => f._id === userId ? { ...f, status } : f));
      });
    }

    return () => {
      if (socket) {
        socket.off('new_friend_request');
        socket.off('friend_request_accepted');
        socket.off('user_status_change');
      }
    };
  }, [socket]);

  const handleSearch = (val) => {
    setSearchQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchUsersToFriend(val);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  };

  const onSendRequest = async (user) => {
    try {
      await sendFriendRequest(user.username);
      showMessage(`Quest for friendship sent to ${user.username}!`, <ScrollText size={16} />);
      
      if (socket) {
        socket.emit('send_friend_request', { 
          receiverId: user._id, 
          senderData: {
            _id: userData._id,
            username: userData.username,
            avatarId: userData.avatarId,
            xp: userData.xp,
            level: userData.level
          } 
        });
      }

      setSearchResults(prev => prev.filter(u => u._id !== user._id));
    } catch (err) {
      showMessage(err.message, <CircleX size={16} />, true);
    }
  };

  const onHandleRequest = async (requestId, action, sender) => {
    try {
      if (action === 'accept') {
        await acceptFriendRequest(requestId);
        showMessage(`Friendship forged with ${sender.username}!`, <Handshake size={16} />);
        
        if (socket) {
          socket.emit('accept_friend_request', { 
            senderId: sender._id, 
            receiverData: {
              _id: userData._id,
              username: userData.username,
              avatarId: userData.avatarId,
              xp: userData.xp,
              level: userData.level
            } 
          });
        }
        
        loadData();
      } else {
        await rejectFriendRequest(requestId);
        setRequests(prev => prev.filter(r => r._id !== requestId));
        showMessage(`Request from ${sender.username} declined.`, <Shield size={16} />);
      }
    } catch (err) {
      showMessage(err.message, <CircleX size={16} />, true);
    }
  };

  const showMessage = (text, icon = null, isError = false) => {
    setMessage({ text, icon, isError });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <div className="animate-spin text-accent"><Swords size={40} /></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="font-title text-2xl sm:text-4xl font-bold text-text1">Social Nexus</h2>
          <p className="text-text3 text-xs sm:text-sm tracking-widest uppercase mt-1">Manage your allies and forge new bonds</p>
        </div>
        <div className="social-tabs flex gap-1.5 bg-bg2/50 p-1 rounded-2xl border border-white/5 w-full sm:w-auto">
          {[
            { id: 'friends', icon: <Users size={14} />, label: 'Friends' },
            { id: 'requests', icon: <BellRing size={14} />, label: 'Requests' },
            { id: 'search', icon: <Search size={14} />, label: 'Search' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all btn-touch relative ${
                activeTab === tab.id 
                ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                : 'text-text3 hover:text-text1'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'requests' && requests.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-surface animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl font-black text-sm z-[100] animate-pop-in flex items-center gap-3 shadow-2xl ${
          message.isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {message.icon && <span className="icon">{message.icon}</span>}
          {message.text}
        </div>
      )}

      <div className="bg-surface border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 min-h-[350px] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-accent2 to-accent opacity-50" />

        {activeTab === 'friends' && (
          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <div className="text-6xl mb-4 flex justify-center text-text3"><Shield size={64} /></div>
                <p className="font-title text-xl uppercase tracking-widest">No Allies Yet</p>
                <button onClick={() => setActiveTab('search')} className="mt-4 text-accent2 hover:underline text-xs font-black flex items-center justify-center gap-2 mx-auto">
                  <UserPlus size={14} /> Find New Warriors
                </button>
              </div>
            ) : (
              <div className="friend-grid grid gap-3 sm:gap-4">
                {friends.map(friend => (
                  <div key={friend._id} 
                    className="bg-bg2/40 border border-white/5 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-accent/30 transition-all group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform block">
                        {AVATARS.find(a => a.id === friend.avatarId)?.emoji || <User size={30} />}
                      </span>
                      <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#050510] ${
                        friend.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg text-text1">{friend.username}</h4>
                        <span className="text-[10px] font-mono text-accent2 uppercase tracking-tighter">LVL {friend.level}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-text3 font-black uppercase tracking-widest">{friend.xp} XP</span>
                        <div className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          friend.status === 'online' ? 'text-green-400' : 'text-text3'
                        }`}>
                          {friend.status === 'online' ? 'Ready for Battle' : 'Resting'}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/${friend.username}`); }}
                      className="p-3 bg-white/5 text-text3 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/5"
                      title="View Profile"
                    >
                      <User size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <div className="text-6xl mb-4 flex justify-center text-text3"><ScrollText size={64} /></div>
                <p className="font-title text-xl uppercase tracking-widest">No Pending Scrolls</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req._id} className="bg-bg2/40 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{AVATARS.find(a => a.id === req.senderId?.avatarId)?.emoji || <User size={40} />}</span>
                    <div>
                      <h4 className="font-title text-xl font-bold text-text1">{req.senderId?.username}</h4>
                      <div className="flex gap-3 text-[10px] text-text3 uppercase font-black tracking-widest mt-1">
                        <span className="text-accent2">LVL {req.senderId?.level}</span>
                        <span>{req.senderId?.xp} XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => onHandleRequest(req._id, 'accept', req.senderId)}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button 
                      onClick={() => onHandleRequest(req._id, 'reject', req.senderId)}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-white/5 hover:bg-red-500/20 text-text3 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text3 group-focus-within:text-accent transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-bg2/40 border-2 border-white/5 rounded-2xl py-4 pl-14 pr-6 text-text1 focus:border-accent/50 outline-none transition-all font-bold placeholder:text-text3/50"
              />
              {searchLoading && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-accent2 animate-spin"><Swords size={20} /></div>
              )}
            </div>

            <div className="friend-grid grid gap-3 sm:gap-4">
              {searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div key={user._id} className="bg-bg2/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:border-accent/20 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-500">
                        {AVATARS.find(a => a.id === user.avatarId)?.emoji || <User size={40} />}
                      </span>
                      <div>
                        <h4 className="font-title text-xl font-bold text-text1">{user.username}</h4>
                        <div className="flex gap-2 text-[10px] text-text3 uppercase font-black tracking-widest mt-1">
                          <span className="text-accent2">LVL {user.level}</span>
                          <span>{user.xp} XP</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onSendRequest(user)}
                      className="w-12 h-12 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-accent/5"
                      title="Add Friend"
                    >
                      <UserPlus size={20} />
                    </button>
                  </div>
                ))
              ) : searchQuery && !searchLoading ? (
                <div className="col-span-full text-center py-20 opacity-40">
                  <p className="font-title text-xl uppercase tracking-widest">No Warrior Found</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
