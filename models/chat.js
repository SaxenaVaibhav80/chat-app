const mongoose = require('mongoose');


const chatModel = new mongoose.Schema({
    senderId:String,
    receiverId:{
        Type:String,
    },
    message: [{
        type: String,                           
        required: true                        
    }],
    roomId: {
        type: String,                           
        required: false                        
    },
    timestamp: {
        type: Date,                            
        default: Date.now          
    }
});

// Export the Chat model
const Chat = mongoose.model('Chat',chatModel);
module.exports = Chat;
