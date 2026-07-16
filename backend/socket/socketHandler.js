const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('addUser', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Joined room: ${conversationId}`);
    });

    socket.on('sendMessage', (message) => {
      io.to(message.conversationId).emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
      console.log('User disconnected:', socket.id);
    });
  });
};