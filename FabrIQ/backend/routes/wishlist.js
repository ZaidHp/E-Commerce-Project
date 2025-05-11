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
      const userId = req.user.id;
      
      const [wishlist] = await db.query(
        'SELECT wishlist_id FROM wishlist WHERE user_id = ?',
        [userId]
      );
      
      if (!wishlist.length) {
        return res.json({ items: [] });
      }
      
      const wishlistId = wishlist[0].wishlist_id;
      
      const [items] = await db.query(
        `SELECT 
          wi.product_id, 
          p.product_name, 
          p.product_price, 
          p.url_key,
          (
            SELECT AVG(rating) 
            FROM product_reviews pr 
            WHERE pr.product_id = p.product_id
          ) AS average_rating,
          pi.image_url 
         FROM wishlist_item wi
         JOIN products p ON wi.product_id = p.product_id
         LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.image_id = (
           SELECT MIN(image_id) FROM product_images WHERE product_id = p.product_id
         )
         WHERE wi.wishlist_id = ?`,
        [wishlistId]
      );
      
      const processedItems = items.map(item => ({
        ...item,
        average_rating: item.average_rating ? parseFloat(item.average_rating) : null
      }));
      
      res.json({ items: processedItems });
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
  });

router.post('/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    
    let [wishlist] = await db.query(
      'SELECT wishlist_id FROM wishlist WHERE user_id = ?',
      [userId]
    );
    
    let wishlistId;
    if (!wishlist.length) {
      const [result] = await db.query(
        'INSERT INTO wishlist (user_id) VALUES (?)',
        [userId]
      );
      wishlistId = result.insertId;
    } else {
      wishlistId = wishlist[0].wishlist_id;
    }
    
    const [existingItem] = await db.query(
      'SELECT wishlist_item_id FROM wishlist_item WHERE wishlist_id = ? AND product_id = ?',
      [wishlistId, productId]
    );
    
    if (existingItem.length) {
      await db.query(
        'DELETE FROM wishlist_item WHERE wishlist_item_id = ?',
        [existingItem[0].wishlist_item_id]
      );
      res.json({ action: 'removed' });
    } else {
      await db.query(
        'INSERT INTO wishlist_item (wishlist_id, product_id) VALUES (?, ?)',
        [wishlistId, productId]
      );
      res.json({ action: 'added' });
    }
  } catch (err) {
    console.error('Error updating wishlist:', err);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

module.exports = router;