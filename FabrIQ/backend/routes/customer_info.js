const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

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

// Get user profile and addresses
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [user] = await db.query(
      'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (!user.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const [addresses] = await db.query(
      'SELECT * FROM user_address WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      user: user[0],
      addresses
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name } = req.body;
    
    if (!first_name || !last_name) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }
    
    await db.query(
      'UPDATE users SET first_name = ?, last_name = ? WHERE user_id = ?',
      [first_name, last_name, userId]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user addresses
router.get('/address', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [addresses] = await db.query(
      'SELECT * FROM user_address WHERE user_id = ?',
      [userId]
    );
    
    res.json({ addresses });
  } catch (err) {
    console.error('Error fetching addresses:', err);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add new address
router.post('/address', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_type, address, city, country, phone_number } = req.body;
    
    if (!address_type || !address || !city || !country || !phone_number) {
      return res.status(400).json({ message: 'All address fields are required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO user_address (user_id, address_type, address, city, country, phone_number) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, address_type, address, city, country, phone_number]
    );
    
    const [newAddress] = await db.query(
      'SELECT * FROM user_address WHERE address_id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newAddress[0]);
  } catch (err) {
    console.error('Error adding address:', err);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Delete address
router.delete('/address/:addressId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;
    
    const [address] = await db.query(
      'SELECT * FROM user_address WHERE address_id = ? AND user_id = ?',
      [addressId, userId]
    );
    
    if (!address.length) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    await db.query(
      'DELETE FROM user_address WHERE address_id = ?',
      [addressId]
    );
    
    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error('Error deleting address:', err);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;