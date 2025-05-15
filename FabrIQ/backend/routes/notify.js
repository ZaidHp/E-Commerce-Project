const express = require('express');
const router = express.Router();
const payfastService = require('../services/payfastService');
const db = require('../db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { console } = require('inspector');

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

router.put('/update/:orderId', authenticateToken, async (req, res) => {
  console.log('--- Starting payment update ---');
  console.log('Headers:', req.headers);
  console.log('Params:', req.params);
  console.log('Body:', req.body);

  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    // Validate orderId is a number
    if (isNaN(orderId)) {
      console.error('Invalid order ID:', orderId);
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Validate paymentStatus
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      console.error('Invalid payment status:', paymentStatus);
      return res.status(400).json({ 
        error: 'Invalid payment status',
        validStatuses: validStatuses
      });
    }

    // Check database connection
    if (!db) {
      console.error('Database connection not established');
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Start transaction
    console.log('Starting transaction for order:', orderId);
    await db.query('START TRANSACTION');

    try {
      // 1. Verify order exists
      const [orderRows] = await db.query(
        'SELECT * FROM orders WHERE order_id = ?', 
        [orderId]
      );
      
      if (orderRows.length === 0) {
        await db.query('ROLLBACK');
        console.error('Order not found:', orderId);
        return res.status(404).json({ error: 'Order not found' });
      }

      // 2. Get latest payment for this order
      const [paymentRows] = await db.query(`
        SELECT * FROM payments 
        WHERE order_id = ?
        LIMIT 1
      `, [orderId]);

      if (paymentRows.length === 0) {
        await db.query('ROLLBACK');
        console.error('No payment found for order:', orderId);
        return res.status(404).json({ error: 'Payment not found for this order' });
      }

      const payment = paymentRows[0];
      console.log('Found payment:', payment);

      // 3. Update payment status
      console.log('Updating payment status to:', paymentStatus);
      const [updateResult] = await db.query(`
        UPDATE payments 
        SET payment_status = ?, updated_at = ?
        WHERE payment_id = ?
      `, [paymentStatus, new Date(), payment.payment_id]);

      if (updateResult.affectedRows === 0) {
        await db.query('ROLLBACK');
        console.error('Payment update failed - no rows affected');
        return res.status(500).json({ error: 'Payment update failed' });
      }

      // 4. Update order status if payment is completed
      let orderStatus = orderRows[0].order_status;
      if (paymentStatus === 'completed') {
        orderStatus = 'processing';
        console.log('Updating order status to:', orderStatus);
        const [orderUpdateResult] = await db.query(`
          UPDATE orders 
          SET order_status = ?, updated_at = ?
          WHERE order_id = ?
        `, [orderStatus, new Date(), orderId]);

        if (orderUpdateResult.affectedRows === 0) {
          await db.query('ROLLBACK');
          console.error('Order status update failed');
          return res.status(500).json({ error: 'Order status update failed' });
        }
      }else if (paymentStatus === 'failed'){
        orderStatus = 'cancelled';
        const [orderUpdateResult] = await db.query(`
          UPDATE orders 
          SET order_status = ?, updated_at = ?
          WHERE order_id = ?
        `, [orderStatus, new Date(), orderId]);
      }

      // Commit transaction
      await db.query('COMMIT');
      console.log('Transaction committed successfully');

      // Return success response
      return res.json({
        success: true,
        message: `Payment status updated to ${paymentStatus}`,
        orderId: orderId,
        paymentId: payment.payment_id
      });

    } catch (dbError) {
      await db.query('ROLLBACK');
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        error: 'Database operation failed',
        details: dbError.message,
        sql: dbError.sql
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;