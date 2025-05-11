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
        p.product_name AS "Product Name", 
        p.sku AS SKU, 
        CONCAT(u.first_name, ' ', u.last_name) AS "Customer Name", 
        pr.rating AS Rating, 
        pr.review_text AS Review, 
        DATE_FORMAT(pr.created_at, '%d-%m-%Y %H:%i:%s') AS "Reviewed At"
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.product_id
      JOIN users u ON pr.user_id = u.user_id
      WHERE p.business_id = ?
    `;

    let queryParams = [business_id];

    
    if (search) {
      query += " AND (p.product_name LIKE ? OR p.sku LIKE ? )";
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (rating) {
      const [minRating, maxRating] = rating.split("-").map(Number);
      query += " AND pr.rating BETWEEN ? AND ?";
      queryParams.push(minRating, maxRating);
    }

    query += " ORDER BY pr.created_at DESC LIMIT ? OFFSET ?";
    queryParams.push(parseInt(limit), parseInt(offset));

    const [reviews] = await pool.query(query, queryParams);

    
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM product_reviews pr 
       JOIN products p ON pr.product_id = p.product_id 
       JOIN users u ON pr.user_id = u.user_id
       WHERE p.business_id = ? 
       ${search ? "AND (p.product_name LIKE ? OR p.sku LIKE ? )" : ""} 
       ${rating ? "AND pr.rating BETWEEN ? AND ?" : ""}`,
      search
        ? rating
          ? [business_id, `%${search}%`, `%${search}%`, ...rating.split("-").map(Number)]
          : [business_id, `%${search}%`, `%${search}%`]
        : rating
        ? [business_id, ...rating.split("-").map(Number)]
        : [business_id]
    );


    res.json({ reviews, totalPages: Math.ceil(countResult[0].total / limit) });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
