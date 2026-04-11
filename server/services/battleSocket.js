const User = require('../models/User');
const Match = require('../models/Match');
const Quest = require('../models/Quest');

// In-memory state
const waitingQueue = []; // { userId, socketId, username }
const activeGames = new Map(); // battleId -> { room, p1, p2, questions, status }

const battleSocket = (io) => {
  const battleNs = io.of('/battles');

  battleNs.on('connection', (socket) => {
    console.log(`📡 Battle Socket Connected: ${socket.id}`);

    socket.on('start_matchmaking', async ({ userId, username }) => {
      // Prevent duplicate entry
      if (waitingQueue.some(u => u.userId === userId)) return;

      // Add to queue
      waitingQueue.push({ userId, socketId: socket.id, username });
      console.log(`🔍 ${username} entered matchmaking. Queue size: ${waitingQueue.length}`);

      // Try to match
      if (waitingQueue.length >= 2) {
        const p1 = waitingQueue.shift();
        const p2 = waitingQueue.shift();

        const battleId = `battle_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        
        // Fetch 5 random questions
        try {
          const questPool = await Quest.find({});
          let allQuestions = [];
          questPool.forEach(q => allQuestions = [...allQuestions, ...q.questions]);
          
          // Randomly pick 5
          const shuffledPool = allQuestions.sort(() => 0.5 - Math.random());
          const matchQuestions = shuffledPool.slice(0, 5).map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          }));

          // Deduct 50 XP from both
          await User.updateMany({ _id: { $in: [p1.userId, p2.userId] } }, { $inc: { xp: -50 } });

          // Create active game state
          activeGames.set(battleId, {
            id: battleId,
            p1: { userId: p1.userId, username: p1.username, score: 0, time: 0, completed: false },
            p2: { userId: p2.userId, username: p2.username, score: 0, time: 0, completed: false },
            questions: matchQuestions,
            startTime: Date.now()
          });

          // Notify players
          battleNs.to(p1.socketId).emit('match_found', { 
            battleId, 
            opponent: p2.username, 
            questions: matchQuestions.map(q => ({ question: q.question, options: q.options })) 
          });
          battleNs.to(p2.socketId).emit('match_found', { 
            battleId, 
            opponent: p1.username, 
            questions: matchQuestions.map(q => ({ question: q.question, options: q.options })) 
          });

          console.log(`⚔️ Match Started: ${p1.username} vs ${p2.username}`);
        } catch (err) {
          console.error("Match initialization failed:", err);
        }
      }
    });

    socket.on('cancel_matchmaking', (userId) => {
      const idx = waitingQueue.findIndex(u => u.userId === userId);
      if (idx > -1) waitingQueue.splice(idx, 1);
    });

    socket.on('join_battle_room', (battleId) => {
      socket.join(battleId);
    });

    socket.on('submit_answer', async ({ battleId, userId, questionIndex, isCorrect, totalTime }) => {
      const game = activeGames.get(battleId);
      if (!game) return;

      const player = (game.p1.userId === userId) ? game.p1 : game.p2;
      if (isCorrect) player.score += 1;
      
      // If last question
      if (questionIndex === 4) {
        player.completed = true;
        player.time = totalTime;
      }

      // Sync progress to opponent
      socket.to(battleId).emit('opponent_progress', { 
        score: player.score, 
        completed: player.completed,
        questionIndex 
      });

      // Check for winner
      if (game.p1.completed && game.p2.completed) {
        await resolveWinner(battleId, battleNs);
      }
    });

    socket.on('battle_timeout', async (battleId) => {
        await resolveWinner(battleId, battleNs);
    });

    socket.on('disconnect', () => {
      const idx = waitingQueue.findIndex(u => u.socketId === socket.id);
      if (idx > -1) waitingQueue.splice(idx, 1);
    });
  });
};

const resolveWinner = async (battleId, ns) => {
  const game = activeGames.get(battleId);
  if (!game || game.status === 'resolved') return;
  game.status = 'resolved';

  const { p1, p2 } = game;
  let winnerId = null;

  if (p1.score > p2.score) winnerId = p1.userId;
  else if (p2.score > p1.score) winnerId = p2.userId;
  else {
    if (p1.time < p2.time && p1.time > 0) winnerId = p1.userId;
    else if (p2.time < p1.time && p2.time > 0) winnerId = p2.userId;
  }

  // Award XP to winner (Standard 100 XP reward - including the 50 invested)
  if (winnerId) {
    const reward = 100; 
    await User.findByIdAndUpdate(winnerId, { $inc: { xp: reward } }); 
    
    await Match.create({
      room: battleId,
      player1: p1.userId,
      player2: p2.userId,
      player1Score: p1.score,
      player2Score: p2.score,
      player1Time: p1.time,
      player2Time: p2.time,
      winner: winnerId,
      questions: game.questions
    });
  }

  ns.to(battleId).emit('battle_result', { 
    winnerId, 
    p1: { username: p1.username, score: p1.score, time: p1.time }, 
    p2: { username: p2.username, score: p2.score, time: p2.time } 
  });

  activeGames.delete(battleId);
};

module.exports = battleSocket;
