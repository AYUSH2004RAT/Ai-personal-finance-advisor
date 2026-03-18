import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = Router();

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email and password' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlyIncome: user.monthlyIncome,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlyIncome: user.monthlyIncome,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, monthlyIncome: req.user.monthlyIncome });
});

router.put('/profile/income', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || isNaN(amount) || amount < 0) {
      return res.status(400).json({ error: 'Please provide a valid income amount' });
    }
    const user = await User.findById(req.user._id);
    user.monthlyIncome = Number(amount);
    await user.save();
    res.json({ monthlyIncome: user.monthlyIncome });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
