// controllers/friendController.js
const { db } = require('../utils/firebase');

// Utility to populate user data (mocking Mongoose populate)
const populateUser = async (userId) => {
  const doc = await db.collection('users').doc(userId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return { _id: doc.id, username: data.username, avatarId: data.avatarId, xp: data.xp, level: data.level };
};

// @desc    Send a friend request
// @route   POST /api/friends/request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverIdentifier } = req.body; // username or userId
    const senderId = req.user._id;

    let receiverDoc = null;

    if (receiverIdentifier.length > 20) {
      receiverDoc = await db.collection('users').doc(receiverIdentifier).get();
    }
    
    if (!receiverDoc || !receiverDoc.exists) {
       const userQuery = await db.collection('users').where('username', '==', receiverIdentifier).limit(1).get();
       if (!userQuery.empty) receiverDoc = userQuery.docs[0];
    }

    if (!receiverDoc || !receiverDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const receiverId = receiverDoc.id;

    if (receiverId === senderId) {
      return res.status(400).json({ error: 'You cannot add yourself' });
    }

    // Check if already friends
    const senderDoc = await db.collection('users').doc(senderId).get();
    const senderData = senderDoc.data();
    if ((senderData.friends || []).includes(receiverId)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check for existing pending request
    const existingSender = await db.collection('friendRequests')
      .where('senderId', '==', senderId)
      .where('receiverId', '==', receiverId)
      .where('status', '==', 'pending').get();
      
    const existingReceiver = await db.collection('friendRequests')
      .where('senderId', '==', receiverId)
      .where('receiverId', '==', senderId)
      .where('status', '==', 'pending').get();

    if (!existingSender.empty || !existingReceiver.empty) {
      return res.status(400).json({ error: 'Friend request already pending' });
    }

    const friendRequestRef = db.collection('friendRequests').doc();
    const reqData = {
      senderId,
      receiverId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await friendRequestRef.set(reqData);

    const populatedSender = await populateUser(senderId);

    res.status(201).json({ 
      message: 'Friend request sent', 
      request: { _id: friendRequestRef.id, ...reqData, senderId: populatedSender } 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requestsQuery = await db.collection('friendRequests')
      .where('receiverId', '==', req.user._id)
      .where('status', '==', 'pending')
      .get();

    const requests = await Promise.all(requestsQuery.docs.map(async (doc) => {
      const data = doc.data();
      const populatedSender = await populateUser(data.senderId);
      return { _id: doc.id, ...data, senderId: populatedSender };
    }));

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

    const requestRef = db.collection('friendRequests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) return res.status(404).json({ error: 'Request not found' });
    const request = requestDoc.data();

    if (request.receiverId !== receiverId) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is no longer pending' });
    }

    await requestRef.update({ status: 'accepted' });

    // Add to both friends lists
    const senderRef = db.collection('users').doc(request.senderId);
    const receiverRef = db.collection('users').doc(receiverId);

    const sDoc = await senderRef.get();
    const rDoc = await receiverRef.get();

    const sFriends = new Set(sDoc.data().friends || []);
    sFriends.add(receiverId);
    await senderRef.update({ friends: Array.from(sFriends) });

    const rFriends = new Set(rDoc.data().friends || []);
    rFriends.add(request.senderId);
    await receiverRef.update({ friends: Array.from(rFriends) });

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

    const requestRef = db.collection('friendRequests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists || requestDoc.data().receiverId !== receiverId) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await requestRef.update({ status: 'rejected' });
    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get friend list
// @route   GET /api/friends
exports.getFriends = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user._id).get();
    const friendIds = userDoc.data().friends || [];
    
    // Populate mock
    const friends = [];
    for (let fid of friendIds) {
      const popUser = await populateUser(fid);
      if (popUser) friends.push(popUser);
    }

    res.json(friends);
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

    // Firestore has no regex search. We do a basic prefix approach, or just fetch all logic for hackathon
    // Better hackathon approach: fetch all and filter in JS if < 1000 users
    const usersQuery = await db.collection('users').get();
    const qLower = query.toLowerCase();
    
    const users = [];
    for (const doc of usersQuery.docs) {
      const data = doc.data();
      if (doc.id === req.user._id) continue;
      
      if (data.username && data.username.toLowerCase().includes(qLower)) {
        users.push({ _id: doc.id, username: data.username, avatarId: data.avatarId, xp: data.xp, level: data.level });
      }
      if (users.length >= 10) break;
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
