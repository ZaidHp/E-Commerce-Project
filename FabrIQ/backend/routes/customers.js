const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:business_id', async (req, res) => {
  const { business_id } = req.params;

  try {
    const conn = await pool.getConnection();

    const [results] = await conn.query(
      `
      SELECT 
        u.user_id AS customer_id,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        MAX(o.created_at) AS last_order_date,
        COUNT(DISTINCT o.order_id) AS total_orders,
        IFNULL(SUM(o.total_amount), 0) / COUNT(DISTINCT o.order_id) AS average_order_value
      FROM users u
      JOIN orders o ON u.user_id = o.user_id
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE p.business_id = ? AND u.user_type = 'customer'
      GROUP BY u.user_id
      `,
      [business_id]
    );

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const customers = results.map((customer) => ({
      id: customer.customer_id,
      "Full Name": customer.full_name,
      Email: customer.email,
      Status:
        new Date(customer.last_order_date) > sixMonthsAgo
          ? "active"
          : "inactive",
      "Average Order Value": customer.average_order_value
        ? Number(customer.average_order_value).toFixed(2)
        : "0.00",
    }));

    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

module.exports = router;
