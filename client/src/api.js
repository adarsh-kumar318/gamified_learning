const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const TIMEOUT  = 15000;

/**
 * Helper to fetch with JWT token from localStorage
 */
export const apiFetch = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    signal: AbortSignal.timeout(TIMEOUT),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
};

// ─── Auth ───────────────────────────────────────────────────────────────────
export const login = async (username, password) => {
  return await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const register = async (username, email, password) => {
  return await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
};

export const fetchProfile = async () => {
  try {
    return await apiFetch('/auth/me');
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    return null;
  }
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const updateAvatar = async (avatarId) => {
  try {
    return await apiFetch('/auth/avatar', {
      method: 'PATCH',
      body: JSON.stringify({ avatarId }),
    });
  } catch {
    return { avatarId };
  }
};

export const refillUserEnergy = async () => {
  return await apiFetch('/auth/refill', {
    method: 'POST'
  });
};

// ─── Quest complete ───────────────────────────────────────────────────────────
export const completeQuestOnServer = async (payload, getToken) => {
  try {
    // Using the unified quest-complete route (backward compat)
    // We'll use the user's clerk-synced ID on the server-side anyway
    return await apiFetch(`/profile/sync-quest`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, getToken);
  } catch (err) {
    console.error('Quest submission failed:', err);
    return payload;
  }
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const fetchLeaderboard = async () => {
  try {
    return await apiFetch('/leaderboard');
  } catch {
    return null;
  }
};

// ─── XP stats ─────────────────────────────────────────────────────────────────
export const fetchXpStats = async (getToken) => {
  try {
    return await apiFetch('/xp/stats', {}, getToken);
  } catch {
    return null;
  }
};

// ─── Badges ───────────────────────────────────────────────────────────────────
export const fetchBadges = async (getToken) => {
  try {
    return await apiFetch('/badges', {}, getToken);
  } catch {
    return null;
  }
};

// ─── Streak ───────────────────────────────────────────────────────────────────
export const checkInStreak = async (getToken) => {
  try {
    return await apiFetch('/streaks/checkin', { method: 'POST' }, getToken());
  } catch {
    return null;
  }
};

export const fetchStreakStatus = async (getToken) => {
  try {
    return await apiFetch('/streaks/status', {}, getToken);
  } catch {
    return null;
  }
};

// ─── RPG Quests ──────────────────────────────────────────────────────────────
export const fetchQuestsList = async () => {
  return await apiFetch('/quests');
};

export const generateAIQuiz = async (subject, level) => {
  return await apiFetch('/quests/generate', {
    method: 'POST',
    body: JSON.stringify({ subject, level }),
  });
};

export const fetchQuestDetail = async (questId) => {
  return await apiFetch(`/quests/${questId}`);
};

export const submitAnswerToQuest = async (questId, questionIndex, selectedOption) => {
  return await apiFetch(`/quests/${questId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ questionIndex, selectedOption }),
  });
};

export const restartQuest = async (questId) => {
  return await apiFetch(`/quests/${questId}/restart`, {
    method: 'POST'
  });
};

// ─── Trial Progress & Resume ──────────────────────────────────────────────────
export const saveQuestProgress = async (questId, currentQuestionIndex, answers) => {
  return await apiFetch('/progress/save', {
    method: 'POST',
    body: JSON.stringify({ questId, currentQuestionIndex, answers }),
  });
};

export const fetchQuestProgress = async (questId) => {
  try {
    return await apiFetch(`/progress/${questId}`);
  } catch {
    return { progress: null };
  }
};

export const finalizeQuest = async (questId, score) => {
  return await apiFetch('/progress/complete', {
    method: 'POST',
    body: JSON.stringify({ questId, score }),
  });
};

export const sendMessageToTutor = async (messages, userContext, getToken) => {
  try {
    return await apiFetch('/tutor/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, userContext }),
    }, getToken);
  } catch {
    return { reply: "The AI Tutor is resting. Please try again in a moment!" };
  }
};

export const fetchAIExplanation = async (question, options, correctAnswer, subject, level) => {
  try {
    return await apiFetch('/tutor/explain', {
      method: 'POST',
      body: JSON.stringify({ question, options, correctAnswer, subject, level }),
    });
  } catch {
    return { explanation: "Focus, warrior. Review the sacred texts and try again." };
  }
};

// ─── Friends ──────────────────────────────────────────────────────────────────
export const fetchFriendsList = async () => {
  return await apiFetch('/friends');
};

export const fetchPendingRequests = async () => {
  return await apiFetch('/friends/requests');
};

export const sendFriendRequest = async (receiverIdentifier) => {
  return await apiFetch('/friends/request', {
    method: 'POST',
    body: JSON.stringify({ receiverIdentifier }),
  });
};

export const acceptFriendRequest = async (requestId) => {
  return await apiFetch(`/friends/accept/${requestId}`, {
    method: 'POST'
  });
};

export const rejectFriendRequest = async (requestId) => {
  return await apiFetch(`/friends/reject/${requestId}`, {
    method: 'POST'
  });
};

export const searchUsersToFriend = async (query) => {
  return await apiFetch(`/friends/search?query=${encodeURIComponent(query)}`);
};
