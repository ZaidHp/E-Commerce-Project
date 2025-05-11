const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:business_name', async (req, res) => {
  try {
    const { business_name } = req.params;
    
    const [rows] = await db.query(`
      SELECT * FROM businesses 
      WHERE business_name = ?
    `, [business_name]);
    
    const business = rows[0];

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }


    const [products] = await db.query(`
        SELECT 
          p.product_id,
          p.product_name,
          p.product_description,
          p.product_price,
          p.url_key,
          (
            SELECT pi.image_url 
            FROM product_images pi 
            WHERE pi.product_id = p.product_id 
            ORDER BY pi.image_id ASC 
            LIMIT 1
          ) as image_url,
          (
            SELECT COALESCE(AVG(pr.rating), 0) 
            FROM product_reviews pr 
            WHERE pr.product_id = p.product_id
          ) as average_rating
        FROM products p
        WHERE 
          p.business_id = ? 
          AND p.product_status = 'enabled' 
          AND p.product_visibility = 'visible'
        ORDER BY p.created_at DESC
      `, [business.business_id]);

    const [reviews] = await db.query(`
      SELECT br.*, CONCAT(u.first_name, ' ', u.last_name) AS username
      FROM business_reviews br
      JOIN users u ON br.user_id = u.user_id
      WHERE br.business_id = ?
      ORDER BY br.created_at DESC
    `, [business.business_id]);

    if (!business.average_rating) {
      const [ratingResult] = await db.query(`
        SELECT AVG(rating) as avg_rating 
        FROM business_reviews 
        WHERE business_id = ?
      `, [business.business_id]);
      
      business.average_rating = ratingResult[0].avg_rating || 0;
    }

    res.json({
      business,
      products,
      reviews
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [businesses] = await db.query(`
      SELECT b.*, 
        (SELECT COUNT(*) FROM products WHERE business_id = b.business_id AND products.product_status = 'enabled' 
          AND products.product_visibility = 'visible') as product_count
      FROM businesses b
      ORDER BY b.created_at DESC
      LIMIT 10
    `);
    
    res.json(businesses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;