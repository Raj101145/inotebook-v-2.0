const jwt = require('jsonwebtoken');

const User = require('../models/User');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    const err = new Error(`Missing ${name} in environment`);
    err.status = 500;
    throw err;
  }
  return v;
}

function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email, name: user.name },
    requireEnv('JWT_SECRET'),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  return { id: String(user._id), name: user.name, email: user.email };
}

async function register(req, res) {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'email already in use' });
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
  });

  const token = signToken(user);

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) return res.status(401).json({ message: 'invalid credentials' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'invalid credentials' });

  const token = signToken(user);

  return res.json({
    token,
    user: sanitizeUser(user),
  });
}

module.exports = { register, login };

