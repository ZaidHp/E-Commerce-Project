const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
      const conn = await pool.getConnection();
      
      // Fetch all categories with parent information
      const [categories] = await conn.query(`
        SELECT 
          c.category_id AS id,
          c.category_name AS name,
          c.parent_category_id,
          p.category_name AS parent_name,
          COUNT(pr.product_id) AS product_count
        FROM categories c
        LEFT JOIN categories p ON c.parent_category_id = p.category_id
        LEFT JOIN products pr ON c.category_id = pr.category_id
        GROUP BY c.category_id, c.category_name, c.parent_category_id, p.category_name
        ORDER BY COALESCE(p.category_name, c.category_name), c.category_name
      `);
      
      conn.release();
      
      // Structure the response to include hierarchy information
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;