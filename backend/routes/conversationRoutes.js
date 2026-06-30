const express = require('express');
const router = express.Router();
const { createOrGetConversation, getConversations } = require('../controllers/conversationController');
const { auth } = require('../middleware/authMiddleware');

router.post('/', auth, createOrGetConversation);
router.get('/', auth, getConversations);

module.exports = router;