const socketIO = require('socket.io');
const User = require('../models/user.model');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map to store connected users
  }

  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:7000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', socket => {
      console.log('New client connected:', socket.id);

      // Handle user connection
      socket.on('user_connected', async userId => {
        this.connectedUsers.set(userId, socket.id);
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);

        // Update user status to online in DB
        await User.findByIdAndUpdate(userId, { status: 'online' });
      });

      // Handle private messages
      socket.on('private_message', data => {
        const { to, message, from } = data;
        const receiverSocketId = this.connectedUsers.get(to);

        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit('private_message', {
            from,
            message,
          });
        } else {
          console.log(`User ${to} is offline`);
          // Optionally store the message in the database for later delivery
        }
      });

      // Handle friend requests
      socket.on('friend_request', async data => {
        const { from, to } = data;
        const receiverSocketId = this.connectedUsers.get(to);

        try {
          // Update sender's sent requests
          await User.findByIdAndUpdate(from, {
            $addToSet: { sentFriendRequests: to },
          });

          // Update receiver's received requests
          await User.findByIdAndUpdate(to, {
            $addToSet: { receivedFriendRequests: from },
          });

          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('friend_request', {
              from,
              to,
            });
          } else {
            console.log(`User ${to} is offline. Friend request sent to DB.`);
            // Optionally, you can store the friend request for later processing
          }
        } catch (error) {
          console.error('Error handling friend request:', error);
        }
      });

      // Handle friend request response
      socket.on('friend_request_response', async data => {
        const { from, to, accepted } = data;
        const senderSocketId = this.connectedUsers.get(from);

        try {
          if (accepted) {
            // Add to friends list for both users
            await User.findByIdAndUpdate(from, {
              $addToSet: { friends: to },
              $pull: { receivedFriendRequests: to },
            });
            await User.findByIdAndUpdate(to, {
              $addToSet: { friends: from },
              $pull: { sentFriendRequests: from },
            });
          } else {
            // Remove from friend requests
            await User.findByIdAndUpdate(from, {
              $pull: { receivedFriendRequests: to },
            });
            await User.findByIdAndUpdate(to, {
              $pull: { sentFriendRequests: from },
            });
          }

          if (senderSocketId) {
            this.io.to(senderSocketId).emit('friend_request_response', {
              from,
              to,
              accepted,
            });
          }
        } catch (error) {
          console.error('Error handling friend request response:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        // Remove user from connected users map
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            console.log(`User ${userId} disconnected`);

            // Update user status to offline in DB
            await User.findByIdAndUpdate(userId, { status: 'offline' });
            break;
          }
        }
      });
    });
  }

  // Method to get socket instance
  getIO() {
    if (!this.io) {
      throw new Error('Socket.IO not initialized');
    }
    return this.io;
  }
}

module.exports = new SocketService();
