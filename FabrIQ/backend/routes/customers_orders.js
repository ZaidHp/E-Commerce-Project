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

// Get user orders with detailed information
// router.get('/', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     // Get orders with business info
//     const [orders] = await db.query(
//       `SELECT 
//         o.order_id, 
//         o.total_amount, 
//         o.order_status, 
//         o.created_at,
//         b.business_id,
//         b.business_name,
//         b.business_logo_url
//       FROM orders o
//       JOIN businesses b ON o.business_id = b.business_id
//       WHERE o.user_id = ?
//       ORDER BY o.created_at DESC`,
//       [userId]
//     );
    
//     // Get order items for each order
//     for (const order of orders) {
//       const [items] = await db.query(
//         `SELECT 
//           oi.item_id,
//           oi.quantity,
//           oi.item_price,
//           p.product_id,
//           p.product_name,
//           p.url_key,
//           (
//             SELECT image_url 
//             FROM product_images 
//             WHERE product_id = p.product_id 
//             LIMIT 1
//           ) AS product_image,
//           s.size,
//           (
//             SELECT review_id 
//             FROM product_reviews 
//             WHERE product_id = p.product_id AND user_id = ?
//             LIMIT 1
//           ) AS review_id,
//           (
//             SELECT rating 
//             FROM product_reviews 
//             WHERE product_id = p.product_id AND user_id = ?
//             LIMIT 1
//           ) AS review_rating
//         FROM order_items oi
//         JOIN products p ON oi.product_id = p.product_id
//         JOIN product_size s ON oi.size_id = s.size_id
//         WHERE oi.order_id = ?`,
//         [userId, userId, order.order_id]
//       );
      
//       // Format product image URL
//       order.items = items.map(item => ({
//         ...item,
//         product_image: item.product_image || 'https://via.placeholder.com/150'
//       }));
//     }
    
//     res.json({ orders });
//   } catch (err) {
//     console.error('Error fetching orders:', err);
//     res.status(500).json({ error: 'Failed to fetch orders' });
//   }
// });

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
        b.business_id,
        b.business_name,
        b.business_logo_url,
        (
          SELECT review_id 
          FROM business_reviews 
          WHERE business_id = b.business_id AND user_id = ?
          LIMIT 1
        ) AS business_review_id,
        (
          SELECT rating 
          FROM business_reviews 
          WHERE business_id = b.business_id AND user_id = ?
          LIMIT 1
        ) AS business_review_rating
      FROM orders o
      JOIN businesses b ON o.business_id = b.business_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
      [userId, userId, userId]
    );
    
    // Get order items for each order
    for (const order of orders) {
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
            WHERE product_id = p.product_id AND user_id = ?
            LIMIT 1
          ) AS review_id,
          (
            SELECT rating 
            FROM product_reviews 
            WHERE product_id = p.product_id AND user_id = ?
            LIMIT 1
          ) AS review_rating
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN product_size s ON oi.size_id = s.size_id
        WHERE oi.order_id = ?`,
        [userId, userId, order.order_id]
      );
      
      order.items = items.map(item => ({
        ...item,
        product_image: item.product_image || 'https://via.placeholder.com/150'
      }));
    }
    
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order details
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    
    // Verify order belongs to user
    const [orderCheck] = await db.query(
      'SELECT order_id FROM orders WHERE order_id = ? AND user_id = ?',
      [orderId, userId]
    );
    
    if (orderCheck.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get order details
    const [[order]] = await db.query(
      `SELECT 
        o.*,
        b.business_name,
        b.business_email,
        b.business_phone,
        b.business_logo_url,
        ua.address AS delivery_address_full,
        ua.city AS delivery_city,
        ua.country AS delivery_country,
        ua.phone_number AS delivery_phone
      FROM orders o
      JOIN businesses b ON o.business_id = b.business_id
      LEFT JOIN user_address ua ON o.delivery_address_id = ua.address_id
      WHERE o.order_id = ?`,
      [orderId]
    );
    
    // Get order items
    const [items] = await db.query(
      `SELECT 
        oi.*,
        p.product_name,
        p.url_key,
        p.product_description,
        s.size,
        c.color_name,
        c.color_code,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.product_id 
          LIMIT 1
        ) AS product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN product_size s ON oi.size_id = s.size_id
      LEFT JOIN product_color c ON oi.color_id = c.color_id
      WHERE oi.order_id = ?`,
      [orderId]
    );
    
    // Format response
    const response = {
      ...order,
      items: items.map(item => ({
        ...item,
        product_image: item.product_image || 'https://via.placeholder.com/150'
      }))
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Cancel an order
// router.post('/:orderId/cancel', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const orderId = req.params.orderId;
    
//     // Verify order belongs to user and can be cancelled
//     const [[order]] = await db.query(
//       `SELECT order_id, order_status 
//       FROM orders 
//       WHERE order_id = ? AND user_id = ?`,
//       [orderId, userId]
//     );
    
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
    
//     if (order.order_status !== 'pending') {
//       return res.status(400).json({ 
//         message: 'Order can only be cancelled when in pending status' 
//       });
//     }
    
//     // Update order status
//     await db.query(
//       'UPDATE orders SET order_status = ? WHERE order_id = ?',
//       ['cancelled', orderId]
//     );
    
//     res.json({ message: 'Order cancelled successfully' });
//   } catch (err) {
//     console.error('Error cancelling order:', err);
//     res.status(500).json({ error: 'Failed to cancel order' });
//   }
// });

// Add this to your existing ordersRoutes.js file
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

module.exports = router;