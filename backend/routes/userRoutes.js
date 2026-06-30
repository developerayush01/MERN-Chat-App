const express = require('express');
const router = express.Router();
const { registerUser, loginUser,logoutUser } = require('../controllers/userController');
const { auth } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout',auth, logoutUser);

module.exports = router;