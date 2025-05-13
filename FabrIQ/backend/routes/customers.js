const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:business_id', async (req, res) => {
  const { business_id } = req.params;

  try {
    // Get connection from pool
    const conn = await pool.getConnection();

    // Simplified query since orders table already has business_id
    const [results] = await conn.query(
      `
      SELECT 
        u.user_id AS customer_id,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        MAX(o.created_at) AS last_order_date,
        COUNT(DISTINCT o.order_id) AS total_orders,
        IFNULL(SUM(o.total_amount), 0) AS total_spent,
        IFNULL(SUM(o.total_amount), 0) / NULLIF(COUNT(DISTINCT o.order_id), 0) AS average_order_value
      FROM users u
      JOIN orders o ON u.user_id = o.user_id
      WHERE o.business_id = ? AND u.user_type = 'customer'
      GROUP BY u.user_id, u.first_name, u.last_name, u.email
      ORDER BY total_spent DESC
      `,
      [business_id]
    );

    // Calculate 6 months ago date
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Format customer data
    const customers = results.map((customer) => ({
      id: customer.customer_id,
      "Full Name": customer.full_name,
      Email: customer.email,
      "Last Order Date": customer.last_order_date ? 
        new Date(customer.last_order_date).toLocaleDateString() : 'Never',
      "Total Orders": customer.total_orders,
      "Total Spent": customer.total_spent ? 
        Number(customer.total_spent).toFixed(2) : "0.00",
      "Average Order Value": customer.average_order_value ? 
        Number(customer.average_order_value).toFixed(2) : "0.00",
      Status: customer.last_order_date && 
              new Date(customer.last_order_date) > sixMonthsAgo ? 
              "active" : "inactive"
    }));

    // Release connection back to pool
    conn.release();

    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ 
      error: "Failed to fetch customers",
      details: err.message 
    });
  }
});

module.exports = router;