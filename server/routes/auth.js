const router = require('express').Router();
const { register, login, getMe, updateAvatar, refillEnergy } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
router.patch('/avatar',  protect, updateAvatar);
router.post('/refill',   protect, refillEnergy);

module.exports = router;
