// controllers/battleController.js
const crypto  = require('crypto');
const Battle  = require('../models/Battle');
const User    = require('../models/User');
const Quest   = require('../models/Quest');
const XPLog   = require('../models/XPLog');
const { evaluateBadges } = require('../utils/badgeEngine');

const genCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();

// POST /api/battles/create
const createBattle = async (req, res) => {
  try {
    const { type = '1v1', category = 'webdev' } = req.body;
    const quests = await Quest.find({ category, isActive: true }).limit(5);
    if (quests.length < 1) return res.status(400).json({ error: 'No quests found for this category.' });

    const battle = await Battle.create({
      inviteCode:  genCode(),
      type,
      category,
      creator:     req.user._id,
      questions:   quests.map(q => q._id),
    });
    res.status(201).json(battle);
  } catch (err) {
    res.status(500).json({ error: 'Could not create battle.' });
  }
};

// POST /api/battles/join
const joinBattle = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const battle = await Battle.findOne({ inviteCode, status: 'waiting' });
    if (!battle) return res.status(404).json({ error: 'Battle not found or already started.' });
    if (String(battle.creator) === String(req.user._id))
      return res.status(400).json({ error: "You can't join your own battle." });

    battle.opponent  = req.user._id;
    battle.status    = 'active';
    battle.startedAt = new Date();
    await battle.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`battle_${battle._id}`).emit('battle_joined', {
        battleId: battle._id, opponent: { username: req.user.username, avatarId: req.user.avatarId }
      });
    }

    res.json(battle);
  } catch (err) {
    res.status(500).json({ error: 'Could not join battle.' });
  }
};

// GET /api/battles/my
const myBattles = async (req, res) => {
  try {
    const battles = await Battle.find({
      $or: [{ creator: req.user._id }, { opponent: req.user._id }]
    }).sort({ createdAt: -1 }).limit(20).populate('creator opponent', 'username avatarId');
    res.json(battles);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch battles.' });
  }
};

// GET /api/battles/:id
const getBattle = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id).populate('creator opponent questions');
    if (!battle) return res.status(404).json({ error: 'Battle not found.' });
    res.json(battle);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/battles/:id/submit-score
const submitScore = async (req, res) => {
  try {
    const { score } = req.body;
    const battle    = await Battle.findById(req.params.id);
    if (!battle || battle.status !== 'active')
      return res.status(400).json({ error: 'Battle not active.' });

    const isCreator = String(battle.creator) === String(req.user._id);
    if (isCreator) battle.creatorScore  = score;
    else           battle.opponentScore = score;

    // If both scores are in, determine winner
    const bothDone = battle.creatorScore > 0 && battle.opponentScore > 0;
    if (bothDone) {
      battle.status  = 'finished';
      battle.endedAt = new Date();
      const winnerId = battle.creatorScore >= battle.opponentScore
        ? battle.creator : battle.opponent;
      battle.winner   = winnerId;
      battle.winnerId = String(winnerId);

      // Award winner XP
      const winner = await User.findById(winnerId);
      if (winner) {
        winner.xp         += 150;
        winner.battlesWon  = (winner.battlesWon || 0) + 1;
        const newBadges    = evaluateBadges(winner.toObject());
        newBadges.forEach(b => winner.earnedBadges.push(b));
        await winner.save();
        await XPLog.create({ userId: winner._id, amount: 150, source: 'battle', sourceId: String(battle._id) });
      }

      const io = req.app.get('io');
      if (io) {
        io.to(`battle_${battle._id}`).emit('battle_result', {
          winner: battle.winnerId,
          scores: { creator: battle.creatorScore, opponent: battle.opponentScore }
        });
      }
    }

    await battle.save();
    res.json(battle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not submit score.' });
  }
};

module.exports = { createBattle, joinBattle, myBattles, getBattle, submitScore };
