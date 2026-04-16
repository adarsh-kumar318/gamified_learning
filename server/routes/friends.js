const express = require('express');
const router = express.Router();
const { 
  sendFriendRequest, 
  getPendingRequests, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  getFriends,
  searchUsers
} = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

router.use(protect); // All friend routes require authentication

router.post('/request', sendFriendRequest);
router.get('/requests', getPendingRequests);
router.post('/accept/:requestId', acceptFriendRequest);
router.post('/reject/:requestId', rejectFriendRequest);
router.get('/', getFriends);
router.get('/search', searchUsers);

module.exports = router;
