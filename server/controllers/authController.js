const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../database/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }

  if (!['admin', 'production', 'defects', 'quality'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selected' });
  }

  const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
    name,
    email,
    hashedPassword,
    role,
  ]);

  return res.status(201).json({
    message: 'User registered successfully',
    user: { id: result.id, name, email, role },
  });
};

const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  const user = await get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches || user.role !== role) {
    return res.status(401).json({ message: 'Invalid credentials or role' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '8h' },
  );

  return res.json({ token, user: publicUser(user) });
};

const profile = async (req, res) => {
  const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(404).json({ message: 'User profile not found' });
  }
  return res.json({ user });
};

module.exports = {
  register,
  login,
  profile,
};
