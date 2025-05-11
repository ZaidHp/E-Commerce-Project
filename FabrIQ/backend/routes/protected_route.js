const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWTPRIVATEKEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [userType] = await db.query('SELECT user_type FROM users WHERE user_id = ?', [userId]);
    if (userType.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user_type: userType[0].user_type });
  } catch (error) {
    console.error('Error fetching user type:', error);
    res.status(500).json({ message: 'Failed to fetch user type' });
  }
});

module.exports = router;