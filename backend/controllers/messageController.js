const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');

// @desc   Send a message
// @route  POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;

    // Save message to MongoDB
    const message = await Message.create({
      conversationId,
      sender: senderId,
      content,
    });

    // Update lastMessage in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const populatedMessage = await message.populate('sender', '-password');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all messages in a conversation
// @route  GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    console.log('HIT sendMessage');
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate('sender', '-password')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages };