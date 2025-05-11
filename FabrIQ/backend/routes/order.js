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


router.post('/', authenticateToken, async (req, res) => {
    const { addressId, items } = req.body;
    const userId = req.user.id;
  
    try {
      await db.query('START TRANSACTION');
  
      const [address] = await db.query(`
        SELECT * FROM user_address WHERE address_id = ? AND user_id = ?
      `, [addressId, userId]);
  
      if (address.length === 0) {
        throw new Error('Address not found');
      }
  
      const [cartItems] = await db.query(`
        SELECT 
          ci.cart_item_id,
          ci.quantity,
          p.product_id,
          p.product_price,
          p.business_id,
          b.business_name,
          b.commission_percentage,
          ps.size_id,
          ps.size
        FROM cart_items ci
        JOIN product_size ps ON ci.size_id = ps.size_id
        JOIN products p ON ps.product_id = p.product_id
        JOIN businesses b ON p.business_id = b.business_id
        JOIN cart c ON ci.cart_id = c.cart_id
        WHERE c.user_id = ?
        ORDER BY p.business_id
      `, [userId]);
  
  
      if (cartItems.length === 0) {
        throw new Error('No items in cart');
      }

      const itemsWithoutSize = cartItems.filter(item => !item.size_id);
      if (itemsWithoutSize.length > 0) {
        throw new Error(`The following products require size selection: ${
          itemsWithoutSize.map(item => item.product_id).join(', ')
        }`);
      }
  
      const businessGroups = {};
      cartItems.forEach(item => {
        if (!businessGroups[item.business_id]) {
          businessGroups[item.business_id] = {
            businessId: item.business_id,
            businessName: item.business_name,
            commissionPercentage: item.commission_percentage,
            items: [],
            totalAmount: 0
          };
        }
        businessGroups[item.business_id].items.push(item);
        businessGroups[item.business_id].totalAmount += item.product_price * item.quantity;
      });
  
      const createdOrders = [];
  
      for (const businessId in businessGroups) {
        const businessGroup = businessGroups[businessId];
        
        const platformCommission = businessGroup.totalAmount * (businessGroup.commissionPercentage / 100);
        const businessEarnings = businessGroup.totalAmount - platformCommission;
  
        const [orderResult] = await db.query(`
          INSERT INTO orders 
          (user_id, business_id, total_amount, platform_commission_amount, business_earnings, delivery_address, order_status)
          VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `, [
          userId,
          businessId,
          businessGroup.totalAmount,
          platformCommission,
          businessEarnings,
          `${address[0].address}, ${address[0].city}, ${address[0].country}`
        ]);
  
        const orderId = orderResult.insertId;
  
        for (const item of businessGroup.items) {
          await db.query(`
            INSERT INTO order_items
            (order_id, product_id, size_id, quantity, item_price)
            VALUES (?, ?, ?, ?, ?)
          `, [orderId, item.product_id, item.size_id, item.quantity, item.product_price]);
        }
  
        createdOrders.push({
          order_id: orderId,
          business_id: businessId,
          business_name: businessGroup.businessName,
          total_amount: businessGroup.totalAmount,
          platform_commission: platformCommission,
          business_earnings: businessEarnings
        });
      }
  
      const [cart] = await db.query('SELECT cart_id FROM cart WHERE user_id = ?', [userId]);
      if (cart.length > 0) {
        await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart[0].cart_id]);
      }
  
      await db.query('COMMIT');
  
      res.json({
        orders: createdOrders,
        message: 'Orders created successfully'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error creating orders:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to create orders',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

module.exports = router;