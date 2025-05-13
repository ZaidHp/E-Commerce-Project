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

router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    if (!['payFast', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Fetch order from database
    const [row] = await db.query(`
      SELECT o.*, u.first_name, u.last_name, u.email, b.business_name, o.total_amount
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN businesses b ON o.business_id = b.business_id
      WHERE o.order_id = ?
    `, [orderId]);
    const order = row[0];
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Handle COD payment
    if (paymentMethod === 'cod') {
      // Create payment record
      await db.query(`
        INSERT INTO payments 
        (order_id, payment_method, payment_status, amount_paid)
        VALUES (?, ?, ?, ?)
      `, [orderId, 'cod', 'pending', order.total_amount]);

      return res.json({ 
        success: true,
        paymentMethod: 'cod',
        message: 'COD payment initiated. Payment will be collected on delivery.'
      });
    }

    // Handle PayFast payment
    const paymentData = payfastService.generatePaymentData({
      orderId: order.order_id,
      amount: order.total_amount,
      user: {
        firstName: order.first_name,
        lastName: order.last_name,
        email: order.email
      },
      businessName: order.business_name
    });

    // Generate payment reference
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const payment_reference = `PF-${orderId}-${timestamp}-${randomNum}`;

    // Create payment record for PayFast
    await db.query(`
      INSERT INTO payments 
      (order_id, payment_method, payment_status, amount_paid, payment_reference)
      VALUES (?, ?, ?, ?, ?)
    `, [
      orderId, 
      'payFast', 
      'pending', 
      order.total_amount,
      payment_reference
    ]);

    res.json({
      ...paymentData,
      paymentMethod: 'payFast',
      payment_reference: payment_reference // Include reference in response
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

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
        ORDER BY created_at DESC
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

// router.post('/notify', authenticateToken, async (req, res) => {
//   try {
//     console.log('Received payment notification request:', req.body);
//     const { orderId, paymentStatus } = req.body;

//     // Validate input
//     if (!orderId || !paymentStatus) {
//       console.error('Missing required fields');
//       return res.status(400).json({ 
//         error: 'Missing orderId or paymentStatus',
//         receivedBody: req.body 
//       });
//     }

//     console.log(`Fetching order ${orderId}...`);
//     const [order] = await db.query(`
//       SELECT order_id, total_amount, order_status
//       FROM orders 
//       WHERE order_id = ?
//     `, [orderId]);

//     if (!order || order.length === 0) {
//       console.error(`Order ${orderId} not found`);
//       return res.status(404).json({ 
//         error: 'Order not found',
//         orderId 
//       });
//     }

//     console.log('Order found:', order[0]);
    
//     // Determine statuses
//     let newOrderStatus, newPaymentStatus;
//     switch (paymentStatus) {
//       case 'COMPLETE':
//         newOrderStatus = 'pending'; // Or 'processing' depending on your workflow
//         newPaymentStatus = 'completed';
//         break;
//       case 'FAILED':
//         newOrderStatus = order[0].order_status; // Keep current status
//         newPaymentStatus = 'failed';
//         break;
//       case 'CANCELLED':
//         newOrderStatus = 'cancelled';
//         newPaymentStatus = 'failed';
//         break;
//       default:
//         console.error('Unknown payment status:', paymentStatus);
//         return res.status(400).json({ 
//           error: 'Unknown payment status',
//           receivedStatus: paymentStatus 
//         });
//     }

//     console.log('Starting transaction...');
//     await db.beginTransaction();

//     try {
//       console.log(`Updating order ${orderId} status to ${newOrderStatus}`);
//       const updateOrderResult = await db.query(`
//         UPDATE orders 
//         SET order_status = ?
//         WHERE order_id = ?
//       `, [newOrderStatus, orderId]);
//       console.log('Order update result:', updateOrderResult);

//       console.log(`Updating payment for order ${orderId} to ${newPaymentStatus}`);
//       const updatePaymentResult = await db.query(`
//         INSERT INTO payments 
//         (order_id, payment_method, payment_status, amount_paid)
//         VALUES (?, ?, ?, ?)
//         ON DUPLICATE KEY UPDATE
//         payment_status = VALUES(payment_status),
//         amount_paid = VALUES(amount_paid),
//         payment_date = NOW()
//       `, [orderId, 'payFast', newPaymentStatus, order[0].total_amount]);
//       console.log('Payment update result:', updatePaymentResult);

//       await db.commit();
//       console.log('Transaction committed successfully');
//       return res.status(200).json({ 
//         success: true, 
//         message: 'Payment processed successfully',
//         orderStatus: newOrderStatus,
//         paymentStatus: newPaymentStatus,
//         orderId
//       });
//     } catch (err) {
//       await db.rollback();
//       console.error('Transaction error:', err);
//       return res.status(500).json({ 
//         error: 'Error processing payment transaction',
//         details: err.message,
//         sqlError: err.sqlMessage 
//       });
//     }
//   } catch (error) {
//     console.error('Payment processing error:', error);
//     return res.status(500).json({ 
//       error: 'Error processing payment',
//       details: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// });

router.post('/notify', async (req, res) => {
  try {
    // PayFast sends data as a URL-encoded string in the body
    const data = req.body;
    
    // Process the notification
    const result = await payFastService.handlePaymentNotification(data);
    
    if (result.verified) {
      // PayFast expects a 200 response to acknowledge receipt
      res.status(200).send('Notification received and processed');
    } else {
      res.status(400).send('Invalid notification');
    }
  } catch (error) {
    console.error('Error processing payment notification:', error);
    res.status(500).send('Error processing notification');
  }
});


// COD Confirmation Endpoint (to be called when delivery is completed and payment is collected)
router.post('/cod/confirm', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Verify order exists
    const [order] = await db.query(`
      SELECT order_id, total_amount 
      FROM orders 
      WHERE order_id = ?
    `, [orderId]);

    if (!order.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Update order status
      await db.query(`
        UPDATE orders 
        SET payment_status = 'completed',
            order_status = 'delivered',
            payment_date = NOW()
        WHERE order_id = ?
      `, [orderId]);

      // Update payment record
      await db.query(`
        UPDATE payments 
        SET payment_status = 'completed',
            payment_date = NOW()
        WHERE order_id = ?
      `, [orderId]);

      await db.commit();
    } catch (err) {
      await db.rollback();
      throw err;
    }

    res.json({ success: true, message: 'COD payment confirmed successfully' });
  } catch (error) {
    console.error('COD confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm COD payment' });
  }
});

module.exports = router;