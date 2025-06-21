const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});



router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.execute(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );

    const user = rows[0];
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store in session
    req.session.user = {
      id: user.user_id,
      username: user.username,
      role: user.role
    };
      console.log('Login request:', req.body);

    res.json({ role: user.role });
  } catch (err) {
    console.error('❌ Login failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// GET /api/my-dogs  – returns [{ dog_id, name }]
router.get('/my-dogs', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') {
    return res.status(401).json({ error: 'Not authorised' });
  }

  try {
    const ownerId = req.session.user.id;
    const [rows] = await db.execute(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?',
      [ownerId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Fetch dogs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;