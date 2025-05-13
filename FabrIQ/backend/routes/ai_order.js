const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const jwt = require('jsonwebtoken');

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

// Configure storage for AI order images
const aiOrderStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = '';
    if (file.fieldname === 'logo') {
      uploadPath = path.join(__dirname, '../uploads/AI-Order/logo');
    } else if (file.fieldname === 'texture') {
      uploadPath = path.join(__dirname, '../uploads/AI-Order/textures');
    } else {
      uploadPath = path.join(__dirname, '../uploads/AI-Order/products');
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: aiOrderStorage });

// Get businesses with AI access
router.get('/businesses', authenticateToken, async (req, res) => {
  try {
    const [businesses] = await db.query(`
      SELECT business_id, business_name, business_logo_url 
      FROM businesses 
      WHERE has_ai_access = 1
    `);
    res.json(businesses);
  } catch (error) {
    console.error('Error fetching AI businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Get AI item prices
router.get('/prices', authenticateToken, async (req, res) => {
  try {
    const [prices] = await db.query('SELECT * FROM ai_item_price');
    res.json(prices);
  } catch (error) {
    console.error('Error fetching AI prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Create AI order
// router.post('/', authenticateToken, upload.fields([
//   { name: 'logo', maxCount: 1 },
//   { name: 'texture', maxCount: 1 },
//   { name: 'product', maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const { business_id, size, quantity, item_type } = req.body;
//     const user_id = req.user.id;

//     // Get price for the item type
//     const [priceResult] = await db.query(
//       'SELECT price FROM ai_item_price WHERE type = ?',
//       [item_type]
//     );
    
//     if (priceResult.length === 0) {
//       return res.status(400).json({ error: 'Invalid item type' });
//     }

//     const item_price = priceResult[0].price;
//     const total_amount = item_price * quantity;

//     // Start transaction
//     await db.beginTransaction();

//     try {
//       // Create order
//       const [orderResult] = await db.query(
//         `INSERT INTO orders 
//         (user_id, business_id, total_amount, platform_commission_amount, business_earnings, delivery_address, order_status) 
//         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
//         [user_id, business_id, total_amount, 0, total_amount, 'AI Order - Address to be confirmed']
//       );

//       const order_id = orderResult.insertId;

//       // Create AI order item
//       const [itemResult] = await db.query(
//         `INSERT INTO ai_order_item 
//         (order_id, size, quantity, item_price) 
//         VALUES (?, ?, ?, ?)`,
//         [order_id, size, quantity, item_price]
//       );

//       const item_id = itemResult.insertId;

//       // Save images
//       const imageRecords = [];
//       if (req.files.logo) {
//         imageRecords.push([
//           item_id,
//           `/uploads/AI-Order/logo/${req.files.logo[0].filename}`,
//           'logo'
//         ]);
//       }
//       if (req.files.texture) {
//         imageRecords.push([
//           item_id,
//           `/uploads/AI-Order/textures/${req.files.texture[0].filename}`,
//           'texture'
//         ]);
//       }
//       if (req.files.product) {
//         imageRecords.push([
//           item_id,
//           `/uploads/AI-Order/products/${req.files.product[0].filename}`,
//           'product'
//         ]);
//       }

//       if (imageRecords.length > 0) {
//         await db.query(
//           `INSERT INTO ai_order_image (item_id, image_url, image_type) 
//           VALUES ?`,
//           [imageRecords]
//         );
//       }

//       await db.commit();
      
//       res.status(201).json({
//         order_id,
//         item_id,
//         total_amount,
//         message: 'AI order created successfully'
//       });
//     } catch (error) {
//       await db.rollback();
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error creating AI order:', error);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// });

// Create AI order
router.post('/', authenticateToken, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'texture', maxCount: 1 },
  { name: 'product', maxCount: 1 }
]), async (req, res) => {
  let connection;
  try {
    const { address_id, business_id, size, quantity, item_type, product_name } = req.body;
    const user_id = req.user.id;

    const [address] = await db.query(`
        SELECT * FROM user_address WHERE address_id = ? AND user_id = ?
      `, [address_id, user_id]);
  
      if (address.length === 0) {
        throw new Error('Address not found');
      }

    // Get price for the item type
    const [priceResult] = await db.query(
      'SELECT price FROM ai_item_price WHERE type = ?',
      [item_type]
    );
    
    if (priceResult.length === 0) {
      return res.status(400).json({ error: 'Invalid item type' });
    }

    const [commissionPercentage] = await db.query(
      'SELECT commission_percentage FROM businesses WHERE business_id = ?',
      [business_id]
    );
    
    const item_price = priceResult[0].price;
    const total_amount = item_price * quantity;
    const platformCommission = total_amount * (commissionPercentage[0].commission_percentage / 100);
    const businessEarnings = total_amount - platformCommission;

    // Get a connection from the pool
    connection = await db.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.query(
        `INSERT INTO orders 
        (user_id, business_id, total_amount, platform_commission_amount, business_earnings, delivery_address, order_status, ai_order) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending', 1)`,
        [user_id, business_id, total_amount, platformCommission, businessEarnings, `${address[0].address}, ${address[0].city}, ${address[0].country}`]
      );

      const order_id = orderResult.insertId;

      // Create AI order item
      const [itemResult] = await connection.query(
        `INSERT INTO ai_order_item 
        (order_id, product_name, size, quantity, item_price) 
        VALUES (?, ?, ?, ?, ?)`,
        [order_id, product_name, size, quantity, item_price]
      );

      const item_id = itemResult.insertId;

      // Save images
      const imageRecords = [];
      if (req.files.logo) {
        imageRecords.push([
          item_id,
          `http://localhost:8080/uploads/AI-Order/logo/${req.files.logo[0].filename}`,
          'logo'
        ]);
      }
      if (req.files.texture) {
        imageRecords.push([
          item_id,
          `http://localhost:8080/uploads/AI-Order/textures/${req.files.texture[0].filename}`,
          'texture'
        ]);
      }
      if (req.files.product) {
        imageRecords.push([
          item_id,
          `http://localhost:8080/uploads/AI-Order/products/${req.files.product[0].filename}`,
          'product'
        ]);
      }

      if (imageRecords.length > 0) {
        await connection.query(
          `INSERT INTO ai_order_image (item_id, image_url, image_type) 
          VALUES ?`,
          [imageRecords]
        );
      }

      await connection.commit();
      
      res.status(201).json({
        orders: [{
          order_id,
          item_id,
          total_amount
        }],
        message: 'AI order created successfully'
      });
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating AI order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;