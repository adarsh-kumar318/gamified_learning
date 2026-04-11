const User           = require('../models/User');
const Match          = require('../models/Match');
const BattleQuestion = require('../models/BattleQuestion');

const SUBJECTS = ['Agentic AI', 'DSA', 'Mathematics', 'Science'];

// In-memory state
const waitingQueue = []; // { userId, socketId, username, subject }
const activeGames  = new Map(); // battleId -> game state

/* ─── Helper: pick 5 random questions for a subject ─────────────────────────── */
const pickQuestions = async (subject) => {
  const filter = subject && SUBJECTS.includes(subject)
    ? { subject }
    : {}; // empty filter = mixed mode

  const questions = await BattleQuestion.aggregate([
    { $match: filter },
    { $sample: { size: 5 } },
    { $project: { _id: 0, question: 1, options: 1, correctAnswer: 1, subject: 1, topic: 1, difficulty: 1 } }
  ]);
  return questions;
};

/* ─── Battle Socket ──────────────────────────────────────────────────────────── */
const battleSocket = (io) => {
  const battleNs = io.of('/battles');

  battleNs.on('connection', (socket) => {
    console.log(`📡 Battle Socket Connected: ${socket.id}`);

    /* ── start_matchmaking ──────────────────────────────────────────────────── *
     * Payload: { userId, username, subject }
     * subject: one of SUBJECTS or undefined/null for mixed mode
     */
    socket.on('start_matchmaking', async ({ userId, username, subject }) => {
      // Prevent duplicate queue entry
      if (waitingQueue.some(u => u.userId === userId)) return;

      waitingQueue.push({ userId, socketId: socket.id, username, subject });
      console.log(`🔍 ${username} entered matchmaking [${subject || 'Mixed'}]. Queue: ${waitingQueue.length}`);

      if (waitingQueue.length >= 2) {
        const p1 = waitingQueue.shift();
        const p2 = waitingQueue.shift();

        // Use p1's subject preference; fall back to mixed if they differ
        const chosenSubject = (p1.subject === p2.subject && p1.subject) ? p1.subject : null;

        const battleId = `battle_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        try {
          const matchQuestions = await pickQuestions(chosenSubject);

          if (matchQuestions.length < 5) {
            // Not enough questions — tell players to try again
            battleNs.to(p1.socketId).emit('matchmaking_error', { message: 'Not enough questions. Run the seed script.' });
            battleNs.to(p2.socketId).emit('matchmaking_error', { message: 'Not enough questions. Run the seed script.' });
            // Push them back to queue
            waitingQueue.unshift(p2);
            waitingQueue.unshift(p1);
            return;
          }

          // Deduct 50 XP entry fee from both players
          await User.updateMany(
            { _id: { $in: [p1.userId, p2.userId] } },
            { $inc: { xp: -50 } }
          );

          // Strip correct answers for the frontend payload
          const questionsForClient = matchQuestions.map(q => ({
            question:   q.question,
            options:    q.options,
            subject:    q.subject,
            topic:      q.topic,
            difficulty: q.difficulty,
          }));

          // Store full questions (with answers) server-side
          activeGames.set(battleId, {
            id: battleId,
            subject: chosenSubject || 'Mixed',
            p1: { userId: p1.userId, username: p1.username, score: 0, time: 0, completed: false },
            p2: { userId: p2.userId, username: p2.username, score: 0, time: 0, completed: false },
            questions: matchQuestions, // includes correctAnswer
            startTime: Date.now(),
            status: 'active',
          });

          // Notify both players
          const payload = (opponentName) => ({
            battleId,
            opponent: opponentName,
            subject:  chosenSubject || 'Mixed',
            questions: questionsForClient,
          });

          battleNs.to(p1.socketId).emit('match_found', payload(p2.username));
          battleNs.to(p2.socketId).emit('match_found', payload(p1.username));

          console.log(`⚔️  Match Started: ${p1.username} vs ${p2.username} | Subject: ${chosenSubject || 'Mixed'}`);
        } catch (err) {
          console.error('Match initialization failed:', err);
        }
      }
    });

    /* ── cancel_matchmaking ─────────────────────────────────────────────────── */
    socket.on('cancel_matchmaking', (userId) => {
      const idx = waitingQueue.findIndex(u => u.userId === userId);
      if (idx > -1) waitingQueue.splice(idx, 1);
    });

    /* ── join_battle_room ───────────────────────────────────────────────────── */
    socket.on('join_battle_room', (battleId) => {
      socket.join(battleId);
    });

    /* ── submit_answer ──────────────────────────────────────────────────────── */
    socket.on('submit_answer', async ({ battleId, userId, questionIndex, selectedOption, totalTime }) => {
      const game = activeGames.get(battleId);
      if (!game || game.status === 'resolved') return;

      const player = (game.p1.userId === userId) ? game.p1 : game.p2;

      // Server-side answer validation
      const question = game.questions[questionIndex];
      const isCorrect = question && selectedOption === question.correctAnswer;
      if (isCorrect) player.score += 1;

      if (questionIndex === game.questions.length - 1) {
        player.completed = true;
        player.time = totalTime;
      }

      // Notify opponent of progress
      socket.to(battleId).emit('opponent_progress', {
        score:         player.score,
        completed:     player.completed,
        questionIndex,
      });

      // Check if both done
      if (game.p1.completed && game.p2.completed) {
        await resolveWinner(battleId, battleNs);
      }
    });

    /* ── battle_timeout ─────────────────────────────────────────────────────── */
    socket.on('battle_timeout', async (battleId) => {
      await resolveWinner(battleId, battleNs);
    });

    /* ── disconnect ─────────────────────────────────────────────────────────── */
    socket.on('disconnect', () => {
      const idx = waitingQueue.findIndex(u => u.socketId === socket.id);
      if (idx > -1) waitingQueue.splice(idx, 1);
    });
  });
};

/* ─── Resolve winner & award XP ─────────────────────────────────────────────── */
const resolveWinner = async (battleId, ns) => {
  const game = activeGames.get(battleId);
  if (!game || game.status === 'resolved') return;
  game.status = 'resolved';

  const { p1, p2 } = game;
  let winnerId = null;

  if (p1.score > p2.score) winnerId = p1.userId;
  else if (p2.score > p1.score) winnerId = p2.userId;
  else {
    // Tie-break by time (lower is better)
    if (p1.time > 0 && p1.time < p2.time) winnerId = p1.userId;
    else if (p2.time > 0 && p2.time < p1.time) winnerId = p2.userId;
  }

  // Award 100 XP to winner (net +50 after entry fee)
  if (winnerId) {
    await User.findByIdAndUpdate(winnerId, { $inc: { xp: 100, coins: 200 } });
  }

  // Persist match result
  await Match.create({
    room:          battleId,
    player1:       p1.userId,
    player2:       p2.userId,
    player1Score:  p1.score,
    player2Score:  p2.score,
    player1Time:   p1.time,
    player2Time:   p2.time,
    winner:        winnerId,
    questions:     game.questions,
  }).catch(err => console.error('Match save failed:', err));

  ns.to(battleId).emit('battle_result', {
    winnerId,
    subject: game.subject,
    p1: { username: p1.username, score: p1.score, time: p1.time },
    p2: { username: p2.username, score: p2.score, time: p2.time },
  });

  activeGames.delete(battleId);
};

module.exports = battleSocket;
