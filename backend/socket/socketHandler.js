const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('addUser', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log('Online users:', onlineUsers);
    });
    
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });
    
    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
};