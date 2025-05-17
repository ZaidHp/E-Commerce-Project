const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const { business_id, search, status, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!business_id) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    let query = `
      SELECT 
        o.order_id AS "Order ID", 
        p.payment_id AS "Payment ID",
        u.email AS "Customer Email",
        p.payment_method AS "Payment Method", 
        p.payment_status, 
        p.amount_paid AS "Amount Paid",
        DATE_FORMAT(p.payment_date, '%d-%m-%Y %H:%i:%s') AS "Payment Date",
        o.total_amount AS "Order Total",
        o.order_status AS "Order Status"
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      JOIN users u ON o.user_id = u.user_id
      WHERE o.business_id = ?`;
    
    let params = [business_id];

    if (search) {
      query += " AND (o.order_id LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += " AND p.payment_status = ?";
      params.push(status);
    }

    query += " ORDER BY p.payment_date DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [payments] = await pool.query(query, params);

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      WHERE o.business_id = ?`;
    
    const countParams = [business_id];

    if (search) {
      countQuery += " AND (o.order_id LIKE ? OR u.email LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      countQuery += " AND p.payment_status = ?";
      countParams.push(status);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const totalPages = Math.ceil(countResult[0].total / limit);

    res.json({ payments, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching payments" });
  }
});

module.exports = router;