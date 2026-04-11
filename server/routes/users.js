const router = require('express').Router();
const { getDashboard, getProfile, updateMe, xpHistory, questHistory } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/dashboard',          protect, getDashboard);
router.get('/me/xp-history',      protect, xpHistory);
router.get('/me/quest-history',   protect, questHistory);
router.patch('/me',               protect, updateMe);
router.get('/:id',                getProfile);

module.exports = router;
