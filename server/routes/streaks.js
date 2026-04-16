const router = require('express').Router();
const { checkIn, streakStatus } = require('../controllers/streakController');
const { protect } = require('../middleware/auth');

router.post('/checkin', protect, checkIn);
router.get('/status',   protect, streakStatus);

module.exports = router;
