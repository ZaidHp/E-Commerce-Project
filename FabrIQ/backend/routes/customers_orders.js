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
    
    // Get orders with business info
    const [orders] = await db.query(
      `SELECT 
        o.order_id, 
        o.total_amount, 
        o.order_status, 
        o.created_at,
        o.ai_order,
        b.business_id,
        b.business_name,
        b.business_logo_url
      FROM orders o
      JOIN businesses b ON o.business_id = b.business_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
      [userId]
    );
    
    // Get order items for each order
    for (const order of orders) {
      // Get business review for this specific order
      const [businessReview] = await db.query(
        `SELECT 
          review_id, 
          rating AS business_review_rating
        FROM business_reviews 
        WHERE business_id = ? AND user_id = ? AND order_id = ?`,
        [order.business_id, userId, order.order_id]
      );
      
      if (businessReview.length > 0) {
        order.business_review_id = businessReview[0].review_id;
        order.business_review_rating = businessReview[0].business_review_rating;
      }

      // Check if this is an AI order
      if (order.ai_order) {
        // Handle AI order items
        const [aiItems] = await db.query(
          `SELECT 
            aoi.item_id,
            aoi.quantity,
            aoi.item_price,
            aoi.product_name,
            aoi.size,
            (
              SELECT image_url 
              FROM ai_order_image 
              WHERE item_id = aoi.item_id AND image_type = 'product' 
              LIMIT 1
            ) AS product_image,
            NULL AS url_key,
            (
              SELECT review_id 
              FROM product_reviews 
              WHERE order_id = ? AND user_id = ?
              AND product_id IS NULL AND item_id = aoi.item_id
              LIMIT 1
            ) AS review_id,
            (
              SELECT rating 
              FROM product_reviews 
              WHERE order_id = ? AND user_id = ?
              AND product_id IS NULL AND item_id = aoi.item_id
              LIMIT 1
            ) AS review_rating
          FROM ai_order_item aoi
          WHERE aoi.order_id = ?`,
          [order.order_id, userId, order.order_id, userId, order.order_id]
        );
        
        order.items = aiItems.map(item => ({
          ...item,
          product_image: item.product_image || 'https://via.placeholder.com/150',
          product_id: null // AI items don't have product_id
        }));
      } else {
        // Handle regular order items
        const [items] = await db.query(
          `SELECT 
            oi.item_id,
            oi.quantity,
            oi.item_price,
            p.product_id,
            p.product_name,
            p.url_key,
            (
              SELECT image_url 
              FROM product_images 
              WHERE product_id = p.product_id 
              LIMIT 1
            ) AS product_image,
            s.size,
            (
              SELECT review_id 
              FROM product_reviews 
              WHERE product_id = p.product_id AND user_id = ? AND order_id = ?
              LIMIT 1
            ) AS review_id,
            (
              SELECT rating 
              FROM product_reviews 
              WHERE product_id = p.product_id AND user_id = ? AND order_id = ?
              LIMIT 1
            ) AS review_rating
          FROM order_items oi
          JOIN products p ON oi.product_id = p.product_id
          JOIN product_size s ON oi.size_id = s.size_id
          WHERE oi.order_id = ?`,
          [userId, order.order_id, userId, order.order_id, order.order_id]
        );
        
        order.items = items.map(item => ({
          ...item,
          product_image: item.product_image || 'https://via.placeholder.com/150'
        }));
      }
    }
    
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    
    // Verify order belongs to user and can be cancelled
    const [[order]] = await db.query(
      `SELECT order_id, order_status 
       FROM orders 
       WHERE order_id = ? AND user_id = ?`,
      [orderId, userId]
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.order_status !== 'pending') {
      return res.status(400).json({ 
        message: 'Order can only be cancelled when in pending status' 
      });
    }
    
    // Update order status
    await db.query(
      'UPDATE orders SET order_status = ? WHERE order_id = ?',
      ['cancelled', orderId]
    );
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ 
      error: 'Failed to cancel order',
      details: err.message 
    });
  }
});

router.get('/ai-order-images/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const [images] = await db.query(
      `SELECT image_url FROM ai_order_image 
      WHERE item_id = ?`,
      [itemId]
    );
    
    res.json({ images });
  } catch (err) {
    console.error('Error fetching AI order images:', err);
    res.status(500).json({ error: 'Failed to fetch AI order images' });
  }
});

module.exports = router;