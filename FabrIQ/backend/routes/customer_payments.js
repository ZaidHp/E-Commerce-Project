// const express = require('express');
// const router = express.Router();
// const payfastService = require('../services/payfastService');
// const db = require('../db');

// // Initiate PayFast payment
// router.post('/initiate', async (req, res) => {
//   try {
//     const { orderId } = req.body;
    
//     // Fetch order from database
//     const [order] = await db.query(`
//       SELECT o.*, u.first_name, u.last_name, u.email, b.business_name 
//       FROM orders o
//       JOIN users u ON o.user_id = u.user_id
//       JOIN businesses b ON o.business_id = b.business_id
//       WHERE o.order_id = ?
//     `, [orderId]);

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     const paymentData = payfastService.generatePaymentData({
//       orderId: order.order_id,
//       amount: order.total_amount,
//       user: {
//         firstName: order.first_name,
//         lastName: order.last_name,
//         email: order.email
//       },
//       businessName: order.business_name
//     });

//     res.json(paymentData);
//   } catch (error) {
//     console.error('Payment initiation error:', error);
//     res.status(500).json({ error: 'Failed to initiate payment' });
//   }
// });

// // PayFast ITN (Instant Transaction Notification) handler
// router.post('/notify', express.urlencoded({ extended: false }), async (req, res) => {
//   try {
//     // Verify the signature
//     const signatureData = Object.keys(req.body)
//       .filter(key => key !== 'signature')
//       .map(key => `${key}=${encodeURIComponent(req.body[key].toString().trim())}`)
//       .join('&');

//     const passphrase = process.env.PAYFAST_PASSPHRASE || '';
//     const calculatedSignature = crypto.createHash('md5')
//       .update(`${signatureData}${passphrase ? `&passphrase=${passphrase}` : ''}`)
//       .digest('hex');
    
//     if (calculatedSignature !== req.body.signature) {
//       return res.status(400).send('Invalid signature');
//     }

//     // Extract payment details
//     const orderId = req.body.m_payment_id;
//     const paymentStatus = req.body.payment_status;
//     const amount = parseFloat(req.body.amount_gross);

//     // Verify order exists and amount matches
//     const [order] = await db.query(`
//       SELECT order_id, total_amount 
//       FROM orders 
//       WHERE order_id = ?
//     `, [orderId]);

//     if (!order.length) return res.status(404).send('Order not found');
//     if (amount !== parseFloat(order[0].total_amount)) {
//       return res.status(400).send('Amount mismatch');
//     }

//     // Update order status based on payment status
//     let newStatus;
//     switch (paymentStatus) {
//       case 'COMPLETE':
//         newStatus = 'paid';
//         break;
//       case 'FAILED':
//         newStatus = 'payment_failed';
//         break;
//       case 'CANCELLED':
//         newStatus = 'cancelled';
//         break;
//       default:
//         return res.status(400).send('Unknown payment status');
//     }

//     await db.query(`
//       UPDATE orders 
//       SET payment_status = ?, 
//           order_status = ?,
//           payment_date = NOW() 
//       WHERE order_id = ?
//     `, [paymentStatus.toLowerCase(), newStatus, orderId]);

//     res.status(200).send('OK');
//   } catch (error) {
//     console.error('PayFast ITN error:', error);
//     res.status(500).send('Error processing payment');
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const payfastService = require('../services/payfastService');
const db = require('../db');
const crypto = require('crypto');
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

// Initiate payment (supports both PayFast and COD)
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

      // Update order status
      // await db.query(`
      //   UPDATE orders 
      //   SET order_status = 'pending',
      //       payment_status = 'pending'
      //   WHERE order_id = ?
      // `, [orderId]);

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

    res.json({
      ...paymentData,
      paymentMethod: 'payFast'
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// PayFast ITN (Instant Transaction Notification) handler
router.post('/notify', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    // Verify the signature
    const signatureData = Object.keys(req.body)
      .filter(key => key !== 'signature')
      .map(key => `${key}=${encodeURIComponent(req.body[key].toString().trim())}`)
      .join('&');

    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const calculatedSignature = crypto.createHash('md5')
      .update(`${signatureData}${passphrase ? `&passphrase=${passphrase}` : ''}`)
      .digest('hex');
    
    if (calculatedSignature !== req.body.signature) {
      return res.status(400).send('Invalid signature');
    }

    // Extract payment details
    const orderId = req.body.m_payment_id;
    const paymentStatus = req.body.payment_status;
    const amount = parseFloat(req.body.amount_gross);

    // Verify order exists and amount matches
    const [order] = await db.query(`
      SELECT order_id, total_amount 
      FROM orders 
      WHERE order_id = ?
    `, [orderId]);

    if (!order.length) return res.status(404).send('Order not found');
    if (amount !== parseFloat(order[0].total_amount)) {
      return res.status(400).send('Amount mismatch');
    }

    // Update payment and order status based on payment status
    let newOrderStatus;
    let newPaymentStatus;
    
    switch (paymentStatus) {
      case 'COMPLETE':
        newOrderStatus = 'pending'; // Order is paid but still needs to be processed
        newPaymentStatus = 'completed';
        break;
      case 'FAILED':
        newOrderStatus = 'pending'; // Order remains pending but payment failed
        newPaymentStatus = 'failed';
        break;
      case 'CANCELLED':
        newOrderStatus = 'cancelled';
        newPaymentStatus = 'failed';
        break;
      default:
        return res.status(400).send('Unknown payment status');
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Update order status
      await db.query(`
        UPDATE orders 
        SET order_status = ?,
            payment_status = ?,
            payment_date = NOW() 
        WHERE order_id = ?
      `, [newOrderStatus, newPaymentStatus, orderId]);

      // Update or create payment record
      await db.query(`
        INSERT INTO payments 
        (order_id, payment_method, payment_status, amount_paid)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        payment_status = VALUES(payment_status),
        amount_paid = VALUES(amount_paid),
        payment_date = NOW()
      `, [orderId, 'payFast', newPaymentStatus, amount]);

      await db.commit();
    } catch (err) {
      await db.rollback();
      throw err;
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast ITN error:', error);
    res.status(500).send('Error processing payment');
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