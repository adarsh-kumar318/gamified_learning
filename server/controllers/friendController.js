const mongoose = require('mongoose');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// @desc    Send a friend request
// @route   POST /api/friends/request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverIdentifier } = req.body; // username or userId
    const senderId = req.user._id;

    // Find receiver
    const receiver = await User.findOne({
      $or: [
        { username: receiverIdentifier },
        { _id: mongoose.isValidObjectId(receiverIdentifier) ? receiverIdentifier : null }
      ].filter(cond => cond._id !== null || cond.username)
    });

    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({ error: 'You cannot add yourself' });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiver._id)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check for existing pending request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { senderId, receiverId: receiver._id, status: 'pending' },
        { senderId: receiver._id, receiverId: senderId, status: 'pending' }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already pending' });
    }

    const friendRequest = await FriendRequest.create({
      senderId,
      receiverId: receiver._id
    });

    // Populate sender info for the socket notification
    const populatedRequest = await friendRequest.populate('senderId', 'username avatarId xp level');

    res.status(201).json({ 
      message: 'Friend request sent', 
      request: populatedRequest 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiverId: req.user._id,
      status: 'pending'
    }).populate('senderId', 'username avatarId xp level');

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Accept friend request
// @route   POST /api/friends/accept/:requestId
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const receiverId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request || request.receiverId.toString() !== receiverId.toString()) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is no longer pending' });
    }

    request.status = 'accepted';
    await request.save();

    // Add to both friends lists
    await User.findByIdAndUpdate(request.senderId, { $addToSet: { friends: request.receiverId } });
    await User.findByIdAndUpdate(request.receiverId, { $addToSet: { friends: request.senderId } });

    res.json({ message: 'Friend request accepted', senderId: request.senderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Reject friend request
// @route   POST /api/friends/reject/:requestId
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const receiverId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request || request.receiverId.toString() !== receiverId.toString()) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get friend list
// @route   GET /api/friends
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username avatarId xp level');
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Search users to add
// @route   GET /api/friends/search?query=...
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user._id }
    }).select('username avatarId xp level').limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
