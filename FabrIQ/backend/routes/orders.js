const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { business_id, search = '', filter = 'select', page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!business_id) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    let filterClause = '';
    if (filter !== 'select') {
      filterClause = `AND o.order_status = ${db.escape(filter)}`;
    }

    const searchClause = search
      ? `AND (u.email LIKE ${db.escape('%' + search + '%')} OR o.order_id LIKE ${db.escape('%' + search + '%')})`
      : '';

    const countQuery = `
      SELECT COUNT(DISTINCT o.order_id) as count
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      JOIN users u ON o.user_id = u.user_id
      WHERE p.business_id = ? ${filterClause} ${searchClause}
    `;

    const [countResult] = await db.query(countQuery, [business_id]);
    const totalOrders = countResult[0].count;
    const totalPages = Math.ceil(totalOrders / limit);

    const ordersQuery = `
    SELECT 
    o.order_id AS "Order ID",
    DATE_FORMAT(MAX(o.created_at), '%d-%m-%Y %H:%i:%s') AS "Created At",
    u.email AS "Customer Email",
    o.order_status AS "Order Status",
    o.total_amount AS "Total Amount",
    o.platform_commission_amount AS "Platform Commission",
    o.business_earnings AS "Total Earnings",
    IFNULL(MAX(pm.payment_status), 'pending') AS payment_status
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    JOIN users u ON o.user_id = u.user_id
    LEFT JOIN payments pm ON o.order_id = pm.order_id
    WHERE p.business_id = ? ${filterClause} ${searchClause}
    GROUP BY o.order_id, u.email, o.order_status, o.total_amount, o.platform_commission_amount, o.business_earnings
    ORDER BY MAX(o.created_at) DESC
    LIMIT ? OFFSET ?

  `;


    const [orders] = await db.query(ordersQuery, [business_id, limit, offset]);

    res.json({ orders, totalPages });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
