const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const { business_id, rating, search, page = 1, limit = 10 } = req.query;

    if (!business_id) {
      return res.status(400).json({ message: "Business ID is required" });
    }

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        pr.review_id, 
        pr.user_id, 
        CASE 
          WHEN pr.item_id IS NOT NULL THEN ai.product_name
          ELSE p.product_name 
        END AS "Product Name",
        CASE 
          WHEN pr.item_id IS NOT NULL THEN 'AI-Order'
          ELSE p.sku 
        END AS SKU,
        CONCAT(u.first_name, ' ', u.last_name) AS "Customer Name", 
        pr.rating AS Rating, 
        pr.review_text AS Review, 
        DATE_FORMAT(pr.created_at, '%d-%m-%Y %H:%i:%s') AS "Reviewed At",
        CASE 
          WHEN pr.item_id IS NOT NULL THEN 'AI Order'
          ELSE 'Regular Product'
        END AS "Review Type"
      FROM product_reviews pr
      LEFT JOIN products p ON pr.product_id = p.product_id
      LEFT JOIN ai_order_item ai ON pr.item_id = ai.item_id
      JOIN users u ON pr.user_id = u.user_id
      JOIN orders o ON pr.order_id = o.order_id
      WHERE o.business_id = ?
    `;

    let queryParams = [business_id];

    if (search) {
      query += ` AND (
        (pr.item_id IS NULL AND (p.product_name LIKE ? OR p.sku LIKE ?)) 
        OR (pr.item_id IS NOT NULL AND ai.product_name LIKE ?)
      )`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (rating) {
      const [minRating, maxRating] = rating.split("-").map(Number);
      query += " AND pr.rating BETWEEN ? AND ?";
      queryParams.push(minRating, maxRating);
    }

    query += " ORDER BY pr.created_at DESC LIMIT ? OFFSET ?";
    queryParams.push(parseInt(limit), parseInt(offset));

    const [reviews] = await pool.query(query, queryParams);

    // Count query
    let countQuery = `
      SELECT COUNT(*) AS total 
      FROM product_reviews pr
      JOIN orders o ON pr.order_id = o.order_id
      WHERE o.business_id = ?
    `;
    
    let countParams = [business_id];

    if (search) {
      countQuery += `
        AND (
          (pr.item_id IS NULL AND EXISTS (
            SELECT 1 FROM products p 
            WHERE p.product_id = pr.product_id 
            AND (p.product_name LIKE ? OR p.sku LIKE ?)
          ))
          OR (pr.item_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM ai_order_item ai 
            WHERE ai.item_id = pr.item_id 
            AND ai.product_name LIKE ?
          ))
        )
      `;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (rating) {
      const [minRating, maxRating] = rating.split("-").map(Number);
      countQuery += " AND pr.rating BETWEEN ? AND ?";
      countParams.push(minRating, maxRating);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({ 
      reviews, 
      totalPages: Math.ceil(countResult[0].total / limit) 
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
});

module.exports = router;