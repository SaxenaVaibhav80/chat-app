const mongoose = require('mongoose');


const chatModel= new mongoose.Schema({
    senderId: String,       // One user in the chat
    receiverId: String,     // The other user in the chat
    message: [
      {
        senderId: String,   // Who sent the message
        receiverId: String, // Who received the message
        text: String,       // The actual message content
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  });

// Export the Chat model
const Chat = mongoose.model('Chat',chatModel);
module.exports = Chat;
