const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const { business_id, search, status, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let query = `SELECT o.order_id AS "Order ID", 
                 u.email AS  "Customer Email",
                 p.payment_method AS  "Payment Method", 
                 p.payment_status, 
                 p.amount_paid AS  "Amount Paid",
                 DATE_FORMAT(p.payment_date, '%d-%m-%Y %H:%i:%s') AS  "Payment Date" 
                 FROM payments p 
                 JOIN orders o ON p.order_id = o.order_id 
                 JOIN users u ON o.user_id = u.user_id 
                 JOIN order_items oi ON o.order_id = oi.order_id 
                 JOIN products pr ON oi.product_id = pr.product_id 
                 WHERE pr.business_id = ?`;
    let params = [business_id];

    if (search) {
      query += " AND (o.order_id LIKE ? OR u.email LIKE ? )";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += " AND p.payment_status = ?";
      params.push(status);
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [payments] = await pool.query(query, params);
    const [countResult] = await pool.query("SELECT COUNT(*) as total FROM payments p JOIN orders o ON p.order_id = o.order_id JOIN order_items oi ON o.order_id = oi.order_id JOIN products pr ON oi.product_id = pr.product_id WHERE pr.business_id = ?", [business_id]);
    const totalPages = Math.ceil(countResult[0].total / limit);

    res.json({ payments, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching payments" });
  }
});

module.exports = router;