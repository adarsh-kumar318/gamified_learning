const router = require('express').Router();
const { xpStats } = require('../controllers/xpController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, xpStats);

module.exports = router;
