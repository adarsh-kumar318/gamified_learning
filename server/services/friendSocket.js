// services/friendSocket.js — Real-time social events (Multi-tab support)
const User = require('../models/User');

const friendSocket = (io) => {
  const onlineUsers = new Map(); // userId -> Set(socketIds)

  const emitToUser = (userId, event, data) => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.forEach(sid => io.to(sid).emit(event, data));
    }
  };

  io.on('connection', (socket) => {
    
    socket.on('register_user', (userId) => {
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      socket.userId = userId;
      
      // Notify all friend statuses
      io.emit('user_status_change', { userId, status: 'online' });
    });

    // ── FRIEND SYSTEM ───────────────────────────────────────────────────────

    socket.on('send_friend_request', ({ receiverId, senderData }) => {
      emitToUser(receiverId, 'new_friend_request', senderData);
    });

    socket.on('accept_friend_request', ({ senderId, receiverData }) => {
      emitToUser(senderId, 'friend_request_accepted', receiverData);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        const sockets = onlineUsers.get(socket.userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(socket.userId);
            io.emit('user_status_change', { userId: socket.userId, status: 'offline' });
          }
        }
      }
    });
  });
};

module.exports = friendSocket;
