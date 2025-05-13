const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWTPRIVATEKEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Configure storage for review media
const reviewMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/reviews';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `review-media-${uniqueSuffix}${ext}`);
  }
});

const uploadReviewMedia = multer({ 
  storage: reviewMediaStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/', authenticateToken, uploadReviewMedia.array('media', 5), async (req, res) => {
  const userId = req.user.id;
  const { product_id, business_id, item_id, rating, review_text, review_type, order_id } = req.body;
  
  if (!rating || !order_id || !review_type) {
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    return res.status(400).json({ 
      message: 'Rating, order_id, and review_type are required' 
    });
  }

  if (review_type === 'product' && !product_id && !item_id) {
    return res.status(400).json({ 
      message: 'For product reviews, either product_id or item_id must be provided' 
    });
  }

  if (review_type === 'business' && !business_id) {
    return res.status(400).json({ 
      message: 'For business reviews, business_id must be provided' 
    });
  }

  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();

    const [[order]] = await conn.query(
      `SELECT ai_order FROM orders WHERE order_id = ? AND user_id = ?`,
      [order_id, userId]
    );
    
    if (!order) {
      throw new Error('Order not found or does not belong to you');
    }

    if (review_type === 'product') {
      if (product_id) {
        const [orderItem] = await conn.query(
          `SELECT 1 FROM order_items oi
          WHERE oi.order_id = ? AND oi.product_id = ?`,
          [order_id, product_id]
        );
        
        if (orderItem.length === 0) {
          throw new Error('Product not found in your order');
        }
      } else if (item_id) {
        if (!order.ai_order) {
          throw new Error('Item ID provided but order is not an AI order');
        }
        
        const [aiItem] = await conn.query(
          `SELECT 1 FROM ai_order_item 
          WHERE order_id = ? AND item_id = ?`,
          [order_id, item_id]
        );
        
        if (aiItem.length === 0) {
          throw new Error('Item not found in your AI order');
        }
      }
    } else if (review_type === 'business') {
      const [orderBiz] = await conn.query(
        `SELECT 1 FROM orders 
        WHERE order_id = ? AND business_id = ?`,
        [order_id, business_id]
      );
      
      if (orderBiz.length === 0) {
        throw new Error('Business not associated with your order');
      }
    }

    let reviewResult = {};
    let mediaTable = '';
    let idField = '';
    let idValue = '';

    if (review_type === 'product') {
      const [existingReview] = await conn.query(
        `SELECT review_id FROM product_reviews 
        WHERE user_id = ? AND order_id = ? 
        AND (product_id = ? OR item_id = ?)`,
        [userId, order_id, product_id || null, item_id || null]
      );

      if (existingReview.length > 0) {
        await conn.query(
          `UPDATE product_reviews 
          SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP
          WHERE review_id = ?`,
          [rating, review_text || null, existingReview[0].review_id]
        );
        reviewResult = { insertId: existingReview[0].review_id };
      } else {
        const [newReview] = await conn.query(
          `INSERT INTO product_reviews 
          (user_id, product_id, item_id, order_id, rating, review_text) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, product_id || null, item_id || null, order_id, rating, review_text || null]
        );
        reviewResult = newReview;
      }
      
      mediaTable = 'product_reviews_media';
      
      if (product_id) {
        idField = 'product_id';
        idValue = product_id;
      } else {
        idField = null;
        idValue = null;
      }
    } else {
      const [existingReview] = await conn.query(
        `SELECT review_id FROM business_reviews 
        WHERE user_id = ? AND business_id = ? AND order_id = ?`,
        [userId, business_id, order_id]
      );

      if (existingReview.length > 0) {
        await conn.query(
          `UPDATE business_reviews 
          SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP
          WHERE review_id = ?`,
          [rating, review_text || null, existingReview[0].review_id]
        );
        reviewResult = { insertId: existingReview[0].review_id };
      } else {
        const [businessReview] = await conn.query(
          `INSERT INTO business_reviews 
          (user_id, business_id, order_id, rating, review_text) 
          VALUES (?, ?, ?, ?, ?)`,
          [userId, business_id, order_id, rating, review_text || null]
        );
        reviewResult = businessReview;
      }
      mediaTable = 'business_review_media';
      idField = 'business_id';
      idValue = business_id;
    }

    if (req.files && req.files.length > 0) {
      const mediaInsertValues = req.files.map(file => [
        reviewResult.insertId,
        `/uploads/reviews/${file.filename}`
      ]);
      
      await conn.query(
        `INSERT INTO ${mediaTable} 
        (review_id, media_url) 
        VALUES ?`,
        [mediaInsertValues]
      );
    }

    if (idField) {
      await conn.query(
        `UPDATE ${review_type === 'product' ? 'products' : 'businesses'} p
        SET average_rating = (
          SELECT AVG(rating) 
          FROM ${review_type === 'product' ? 'product_reviews' : 'business_reviews'} 
          WHERE ${idField} = p.${idField}
        )
        WHERE ${idField} = ?`,
        [idValue]
      );
    }

    await conn.commit();
    
    res.status(201).json({ 
      message: 'Review submitted successfully',
      review_id: reviewResult.insertId
    });
  } catch (err) {
    await conn.rollback();
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    
    console.error('Error submitting review:', err);
    res.status(500).json({ 
      error: 'Failed to submit review',
      message: err.message 
    });
  } finally {
    conn.release();
  }
});

router.get('/product/:productId', async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await db.getConnection();

    const [reviews] = await conn.query(
      `SELECT 
        pr.review_id,
        pr.rating,
        pr.review_text,
        pr.created_at,
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        (
          SELECT COUNT(*) 
          FROM product_reviews_media prm 
          WHERE prm.review_id = pr.review_id
        ) AS media_count
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.user_id
      WHERE pr.product_id = ?
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?`,
      [productId, parseInt(limit), offset]
    );

    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM product_reviews WHERE product_id = ?`,
      [productId]
    );

    for (const review of reviews) {
      if (review.media_count > 0) {
        const [media] = await conn.query(
          `SELECT media_url FROM product_reviews_media WHERE review_id = ?`,
          [review.review_id]
        );
        review.media = media.map(m => m.media_url);
      } else {
        review.media = [];
      }
      delete review.media_count;
    }

    conn.release();

    res.json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching product reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.get('/business/:businessId', async (req, res) => {
  const { businessId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conn = await db.getConnection();

    const [reviews] = await conn.query(
      `SELECT 
        br.review_id,
        br.rating,
        br.review_text,
        br.created_at,
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        (
          SELECT COUNT(*) 
          FROM business_review_media brm 
          WHERE brm.review_id = br.review_id
        ) AS media_count
      FROM business_reviews br
      JOIN users u ON br.user_id = u.user_id
      WHERE br.business_id = ?
      ORDER BY br.created_at DESC
      LIMIT ? OFFSET ?`,
      [businessId, parseInt(limit), offset]
    );

    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM business_reviews WHERE business_id = ?`,
      [businessId]
    );

    for (const review of reviews) {
      if (review.media_count > 0) {
        const [media] = await conn.query(
          `SELECT media_url FROM business_review_media WHERE review_id = ?`,
          [review.review_id]
        );
        review.media = media.map(m => m.media_url);
      } else {
        review.media = [];
      }
      delete review.media_count;
    }

    conn.release();

    res.json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching business reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.delete('/:reviewId', authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();

    const [[review]] = await conn.query(
      `SELECT review_id, product_id FROM product_reviews 
      WHERE review_id = ? AND user_id = ?`,
      [reviewId, userId]
    );

    if (!review) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: 'Review not found' });
    }

    const [media] = await conn.query(
      `SELECT media_url FROM product_reviews_media WHERE review_id = ?`,
      [reviewId]
    );

    await conn.query(
      `DELETE FROM product_reviews WHERE review_id = ?`,
      [reviewId]
    );

    await conn.query(
      `DELETE FROM product_reviews_media WHERE review_id = ?`,
      [reviewId]
    );

    await conn.query(
      `UPDATE products p
      SET average_rating = (
        SELECT AVG(rating) 
        FROM product_reviews 
        WHERE product_id = p.product_id
      )
      WHERE product_id = ?`,
      [review.product_id]
    );

    await conn.commit();
    conn.release();

    media.forEach(item => {
      const filePath = path.join(__dirname, '..', item.media_url);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`Could not delete file: ${filePath}`, err);
      }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

router.get('/user/business-reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const conn = await db.getConnection();

    const [reviews] = await conn.query(
      `SELECT 
        br.review_id,
        br.rating,
        br.review_text,
        br.created_at,
        b.business_id,
        b.business_name,
        b.business_logo_url,
        (
          SELECT COUNT(*) 
          FROM business_review_media brm 
          WHERE brm.review_id = br.review_id
        ) AS media_count
      FROM business_reviews br
      JOIN businesses b ON br.business_id = b.business_id
      WHERE br.user_id = ?
      ORDER BY br.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    const [[{ total }]] = await conn.query(
      `SELECT COUNT(*) AS total FROM business_reviews WHERE user_id = ?`,
      [userId]
    );
    
    for (const review of reviews) {
      if (review.media_count > 0) {
        const [media] = await conn.query(
          `SELECT media_url FROM business_review_media WHERE review_id = ?`,
          [review.review_id]
        );
        review.media = media.map(m => m.media_url);
      } else {
        review.media = [];
      }
      delete review.media_count;
    }

    conn.release();

    res.json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching business reviews:', err);
    res.status(500).json({ error: 'Failed to fetch business reviews' });
  }
});

module.exports = router;