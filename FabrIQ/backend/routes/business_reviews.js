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
        br.review_id, 
        br.user_id, 
        CONCAT(u.first_name, ' ', u.last_name) AS "Customer Name", 
        br.rating AS Rating, 
        br.review_text AS Review, 
        DATE_FORMAT(br.created_at, '%d-%m-%Y %H:%i:%s') AS "Reviewed At"
      FROM business_reviews br
      JOIN users u ON br.user_id = u.user_id
      WHERE br.business_id = ?
    `;

    let queryParams = [business_id];

    if (search) {
      query += " AND (u.first_name LIKE ? OR u.last_name LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (rating) {
      const [minRating, maxRating] = rating.split("-").map(Number);
      query += " AND br.rating BETWEEN ? AND ?";
      queryParams.push(minRating, maxRating);
    }

    query += " ORDER BY br.created_at DESC LIMIT ? OFFSET ?";
    queryParams.push(parseInt(limit), parseInt(offset));

    const [reviews] = await pool.query(query, queryParams);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM business_reviews br 
       JOIN users u ON br.user_id = u.user_id 
       WHERE br.business_id = ? 
       ${search ? "AND (u.first_name LIKE ? OR u.last_name LIKE ?)" : ""} 
       ${rating ? "AND br.rating BETWEEN ? AND ?" : ""}`,
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
    console.error("Error fetching business reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
