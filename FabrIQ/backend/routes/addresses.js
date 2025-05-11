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

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [addresses] = await db.query(`
      SELECT 
        ua.address_id,
        ua.address_type,
        ua.address,
        ua.city,
        ua.country,
        ua.phone_number,
        u.first_name,
        u.last_name
      FROM user_address ua
      JOIN users u ON ua.user_id = u.user_id
      WHERE ua.user_id = ?
      ORDER BY ua.address_type, ua.created_at DESC
    `, [req.user.id]);

    res.json(addresses);
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json({ 
      message: 'Failed to fetch addresses',
      error: error.message 
    });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { addressType, address, city, country, phoneNumber } = req.body;
    
    if (!addressType || !address || !city || !country || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [result] = await db.query(`
      INSERT INTO user_address 
      (user_id, address_type, address, city, country, phone_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, addressType, address, city, country, phoneNumber]);

    const [newAddress] = await db.query(`
      SELECT 
        ua.address_id,
        ua.address_type,
        ua.address,
        ua.city,
        ua.country,
        ua.phone_number,
        u.first_name,
        u.last_name
      FROM user_address ua
      JOIN users u ON ua.user_id = u.user_id
      WHERE ua.address_id = ?
    `, [result.insertId]);

    res.status(201).json(newAddress[0]);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ 
      message: 'Failed to add address',
      error: error.message 
    });
  }
});

router.delete('/:addressId', authenticateToken, async (req, res) => {
    try {
      const { addressId } = req.params;
      
      const [address] = await db.query(`
        SELECT user_id FROM user_address WHERE address_id = ?
      `, [addressId]);
  
      if (address.length === 0) {
        return res.status(404).json({ message: 'Address not found' });
      }
  
      if (address[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this address' });
      }
  
      await db.query(`
        DELETE FROM user_address WHERE address_id = ?
      `, [addressId]);
  
      res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ 
        message: 'Failed to delete address',
        error: error.message 
      });
    }
  });

module.exports = router;