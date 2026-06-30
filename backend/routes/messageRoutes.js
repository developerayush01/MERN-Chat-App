const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { auth } = require('../middleware/authMiddleware');

router.post('/', auth, sendMessage);
router.get('/:conversationId', auth, getMessages);

module.exports = router;