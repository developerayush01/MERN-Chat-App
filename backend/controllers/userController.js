const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return token;
};

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const registerUser = async (req, res) => {
  try {
    console.log('1. Register request received:', req.body.email);

    const { username, email, password } = req.body;

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    console.log('2. Checking if user exists...');
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    console.log('3. User does not exist, proceeding...');

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log('4. Creating user in DB...');
    const user = await User.create({
      username,
      email,
      password,
      otp,
      otpExpiry,
    });
    console.log('5. User created:', user._id);

    console.log('6. Attempting to send email...');
    await sendEmail(email, otp);
    console.log('7. Email sent successfully!');

    res.status(201).json({
      message: 'OTP sent to your email. Please verify to continue.',
      userId: user._id,
    });
    console.log('8. Response sent to client');
  } catch (error) {
    console.log('ERROR at some step:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!await user.matchPassword(password)) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    // if not verified, send new OTP
    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendEmail(email, otp);

      return res.status(403).json({
        message: 'Account not verified. New OTP sent to your email.',
        userId: user._id,
      });
    }

    generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const { username, profilePic } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
user.profilePic = profilePic || user.profilePic;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    const users = await User.find({
      username: { $regex: username, $options: 'i' },
      _id: { $ne: req.user._id },
    }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = { registerUser, loginUser, logoutUser, getMe, getProfile, editProfile, searchUsers, verifyOtp };
