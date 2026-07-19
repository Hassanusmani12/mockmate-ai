const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    console.log(`Signup attempt for email: ${email}`);

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed });
    const token = generateToken(user._id);

    console.log(`User created successfully: ${user._id}`);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error('Signup error:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: `Validation error: ${err.message}` });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists (duplicate key)' });
    }
    res.status(500).json({ message: err.message || 'Signup failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log(`Login attempt for email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    console.log(`Login successful: ${user._id}`);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      resumeUrl: user.resumeUrl,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    console.error('Error message:', err.message);
    res.status(500).json({ message: err.message || 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: err.message || 'Failed to get user' });
  }
};
