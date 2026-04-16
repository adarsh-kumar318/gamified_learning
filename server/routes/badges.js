const router = require('express').Router();
const { getBadges } = require('../controllers/badgeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBadges);

module.exports = router;
