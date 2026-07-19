const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, getProfile, editProfile, searchUsers, verifyOtp } = require('../controllers/userController');

router.post('/verify-otp', verifyOtp);
const { auth } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getMe);
router.get('/profile/:id', auth, getProfile);
router.get('/search', auth, searchUsers);
router.put('/edit', auth, editProfile);
router.post('/logout',auth, logoutUser);
router.post('/verify-otp', verifyOtp);

module.exports = router;