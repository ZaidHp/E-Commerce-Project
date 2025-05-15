const express = require('express');
const router = express.Router();
// const { authenticateBusiness } = require('../middleware/auth');
const db = require('../db');

// Get all available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const [plans] = await db.query('SELECT * FROM subscription_plans');
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subscription plans' });
  }
});

// Get current business subscription status
router.get('/status', async (req, res) => { //, authenticateBusiness
  try {
    const businessId = req.business.business_id;
    
    const [subscription] = await db.query(`
      SELECT s.*, p.plan_name, p.plan_price 
      FROM subscriptions s
      JOIN subscription_plans p ON s.plan_id = p.plan_id
      WHERE s.business_id = ? AND s.subscription_status = 'active'
      ORDER BY s.end_date DESC
      LIMIT 1
    `, [businessId]);

    res.json(subscription[0] || { hasSubscription: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subscription status' });
  }
});

// Create a new subscription
router.post('/subscribe', async (req, res) => { //, authenticateBusiness
  try {
    const businessId = req.business.business_id;
    const { planId, paymentMethodId } = req.body;

    // Validate plan exists
    const [plan] = await db.query('SELECT * FROM subscription_plans WHERE plan_id = ?', [planId]);
    if (!plan.length) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    // Process payment (mock implementation)
    // In production, integrate with Stripe, PayPal, etc.
    const paymentSuccess = await processPayment(paymentMethodId, plan[0].plan_price);
    if (!paymentSuccess) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan[0].plan_duration_days);

    // Create subscription
    await db.query(`
      INSERT INTO subscriptions 
      (business_id, plan_id, start_date, end_date, subscription_status)
      VALUES (?, ?, ?, ?, 'active')
    `, [businessId, planId, startDate, endDate]);

    // Update business AI access
    await db.query('UPDATE businesses SET has_ai_access = 1 WHERE business_id = ?', [businessId]);

    res.json({ success: true, message: 'Subscription created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating subscription' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => { //, authenticateBusiness
  try {
    const businessId = req.business.business_id;
    
    await db.query(`
      UPDATE subscriptions 
      SET subscription_status = 'cancelled' 
      WHERE business_id = ? AND subscription_status = 'active'
    `, [businessId]);

    // Update business AI access
    await db.query('UPDATE businesses SET has_ai_access = 0 WHERE business_id = ?', [businessId]);

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
});

async function processPayment(paymentMethodId, amount) {
  // Mock payment processing - in real app, integrate with payment provider
  return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}

module.exports = router;