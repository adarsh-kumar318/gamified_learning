const router = require('express').Router();
const { globalLeaderboard, weeklyLeaderboard } = require('../controllers/leaderboardController');

router.get('/',        globalLeaderboard);
router.get('/weekly',  weeklyLeaderboard);

module.exports = router;
