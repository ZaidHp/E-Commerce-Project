const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/products';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// // Configure AWS S3 client
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//   }
// });

// // Configure multer for memory storage (we'll stream directly to S3)
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   }
// });

// // Helper function to upload file to S3
// const uploadToS3 = async (file, folder = 'products') => {
//   const fileExtension = path.extname(file.originalname);
//   const key = `${folder}/${uuidv4()}${fileExtension}`;
  
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: key,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     // ACL: 'public-read'
//   };

  // await s3Client.send(new PutObjectCommand(params));
  // return `${process.env.AWS_S3_BUCKET_URL}/${key}`;

//   try {
//     await s3Client.send(new PutObjectCommand(params));
//     return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
//   } catch (error) {
//     console.error('S3 Upload Error:', error);
//     throw error;
//   }
// };

// Helper function to delete file from S3
// const deleteFromS3 = async (url) => {
//   const key = url.replace(`${process.env.AWS_S3_BUCKET_URL}/`, '');
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: key
//   };

//   try {
//     await s3Client.send(new DeleteObjectCommand(params));
//     return true;
//   } catch (error) {
//     console.error('Error deleting file from S3:', error);
//     return false;
//   }
// };

router.post('/', upload.fields([{ name: "images", maxCount: 10 }]), async (req, res) => {
  const {
    business_id,
    sku,
    product_name,
    product_description,
    product_price,
    weight,
    manage_stock,
    stock_availability,
    category_id,
    product_status,
    product_visibility,
    url_key,
    attributes
  } = req.body;

  console.log(req.body);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const parsedAttributes = JSON.parse(attributes || '[]');
    const product_quantity = parsedAttributes.reduce((total, attr) => {
      return total + attr.sizes.reduce((sum, size) => sum + (parseInt(size.quantity) || 0), 0);
    }, 0);

    console.log(product_quantity);

    const [productResult] = await conn.query(
      `INSERT INTO products (
        business_id, sku, product_name, product_description,
        product_price, weight, product_quantity,
        manage_stock, stock_availability,
        category_id, product_status,
        product_visibility, url_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business_id,
        sku,
        product_name,
        product_description,
        product_price,
        weight,
        product_quantity,
        manage_stock,
        stock_availability,
        category_id || "1",
        product_status,
        product_visibility,
        url_key,
      ]
    );

    const product_id = productResult.insertId;

    for (const attr of parsedAttributes) {
      const [colorResult] = await conn.query(
        `INSERT INTO product_color (
          product_id, color_name, color_code
        ) VALUES (?, ?, ?)`,
        [product_id, attr.color_name, attr.color_hex]
      );
      
      const color_id = colorResult.insertId;
      
      for (const size of attr.sizes) {
        await conn.query(
          `INSERT INTO product_size (
            product_id, color_id, size, quantity
          ) VALUES (?, ?, ?, ?)`,
          [product_id, color_id, size.size, size.quantity]
        );
      }
    }

    if (req.files?.images?.length > 0) {
      for (const file of req.files.images) {
        const imageUrl = `http://localhost:8080/uploads/products/${file.filename}`;
        await conn.query(
          'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
          [product_id, imageUrl]
        );
      }
    }

    // if (req.files?.images?.length > 0) {
    //   for (const file of req.files.images) {
    //     const imageUrl = await uploadToS3(file, 'products');
    //     await conn.query(
    //       'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
    //       [product_id, imageUrl]
    //     );
    //   }
    // }

    await conn.commit();
    res.status(201).json({ 
      product_id, 
      message: 'Product and attributes saved successfully' 
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error saving product:', error);
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});


router.get('/', async (req, res) => {
  const { business_id } = req.query;
  if (!business_id) {
    return res.status(400).json({ error: "Missing business_id" });
  }

  try {
    const conn = await pool.getConnection();

    const [results] = await conn.query(`
      SELECT 
        p.product_id AS id, 
        p.product_name AS NAME,
        p.product_price AS PRICE,
        p.sku AS SKU,
        p.product_quantity AS STOCK,
        p.product_status AS STATUS,
        (
          SELECT image_url FROM product_images 
          WHERE product_id = p.product_id 
          LIMIT 1
        ) AS THUMBNAIL,
        (
          SELECT ROUND(AVG(rating), 1)
          FROM product_reviews
          WHERE product_id = p.product_id
        ) AS AVERAGE_RATING
      FROM products p
      WHERE p.business_id = ?
    `, [business_id]);

    const products = results.map(product => ({
      ...product,
      PRICE: `$${parseFloat(product.PRICE).toFixed(2)}`,
      THUMBNAIL: product.THUMBNAIL || 'https://via.placeholder.com/50',
      AVERAGE_RATING: product.AVERAGE_RATING !== null ? product.AVERAGE_RATING : 'N/A'
    }));

    conn.release();
    res.json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await pool.getConnection();

    const [productRows] = await conn.query(
      `
      SELECT 
        p.*, 
        sc.category_id AS subcategory_id,
        sc.category_name AS subcategory_name,
        pc.category_id AS parent_category_id,
        pc.category_name AS parent_category_name
      FROM products p
      LEFT JOIN categories sc ON p.category_id = sc.category_id
      LEFT JOIN categories pc ON sc.parent_category_id = pc.category_id
      WHERE p.product_id = ?
      `,
      [id]
    );

    if (productRows.length === 0) {
      conn.release();
      return res.status(404).json({ message: 'Product not found' });
    }

    const rawProduct = productRows[0];
    const product = {};

    for (const [key, value] of Object.entries(rawProduct)) {
      product[key.toLowerCase()] = value;
    }

    product.category = {
      id: rawProduct.parent_category_id || rawProduct.subcategory_id || null,
      name: rawProduct.parent_category_name || rawProduct.subcategory_name || null,
      subcategories: rawProduct.subcategory_id ? [
        {
          id: rawProduct.subcategory_id,
          name: rawProduct.subcategory_name
        }
      ] : []
    };

    delete product.parent_category_id;
    delete product.parent_category_name;
    delete product.subcategory_id;
    delete product.subcategory_name;

    const [imageRows] = await conn.query(
      'SELECT image_url FROM product_images WHERE product_id = ?',
      [id]
    );
    product.images = imageRows.map((row) => row.image_url);

    const [colorRows] = await conn.query(
      'SELECT * FROM product_color WHERE product_id = ?',
      [id]
    );

    product.attributes = await Promise.all(colorRows.map(async (color) => {
      const [sizes] = await conn.query(
        'SELECT * FROM product_size WHERE product_id = ? AND color_id = ?',
        [id, color.color_id]
      );
      
      return {
        color_name: color.color_name,
        color_hex: color.color_code,
        sizes: sizes.map(size => ({
          size: size.size,
          quantity: size.quantity
        }))
      };
    }));

    conn.release();
    res.json(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




router.put('/unlist', async (req, res) => {
  const { product_id } = req.body;

  if (!Array.isArray(product_id) || product_id.length === 0) {
    return res.status(400).json({ error: "No products selected" });
  }

  try {
    const conn = await pool.getConnection();
    await conn.query(
      `UPDATE products 
        SET 
          product_status = 'disabled',
          product_visibility = 'not_visible'
          WHERE product_id IN (?)`,
      [product_id]
    );
    conn.release();
    res.json({ message: "Selected products have been unlisted" });
  } catch (err) {
    console.error("Error unlisting products:", err);
    res.status(500).json({ error: "Server error while unlisting products" });
  }
});

router.put('/relist', async (req, res) => {
  const { product_id } = req.body;

  if (!Array.isArray(product_id) || product_id.length === 0) {
    return res.status(400).json({ error: "No products selected" });
  }

  try {
    const conn = await pool.getConnection();
    await conn.query(
      `UPDATE products 
      SET 
        product_status = 'enabled',
        product_visibility = 'visible'
        WHERE product_id IN (?)`,
      [product_id]
    );
    conn.release();
    res.json({ message: "Selected products have been relisted" });
  } catch (err) {
    console.error("Error relisting products:", err);
    res.status(500).json({ error: "Server error while relisting products" });
  }
});

router.delete("/delete", async (req, res) => {
  const { product_id } = req.body;

  if (!Array.isArray(product_id) || product_id.length === 0) {
    return res.status(400).json({ error: "No products selected" });
  }

  try {
    const conn = await pool.getConnection();
    await conn.query(
      `UPDATE products
      SET 
        product_status = 'deleted', 
        product_visibility = 'not_visible'
        WHERE product_id IN (?)`,
      [product_id]
    );
    conn.release();
    res.json({ message: "Selected products marked as deleted." });
  } catch (err) {
    console.error("Error soft-deleting products:", err);
    res.status(500).json({ error: "Server error while soft-deleting products" });
  }
});


router.put("/:id", upload.array("images"), async (req, res) => {
  const { id } = req.params;
  const {
    product_name, sku, product_price, product_description,
    weight, manage_stock, product_status,
    product_visibility, url_key, stock_availability, 
    business_id, category_id, attributes,
    removedImages
  } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const parsedAttributes = JSON.parse(attributes || '[]');
    const product_quantity = parsedAttributes.reduce((total, attr) => {
      return total + attr.sizes.reduce((sum, size) => sum + (parseInt(size.quantity) || 0), 0);
    }, 0);

    await conn.query(
      `UPDATE products SET 
        product_name=?, sku=?, product_price=?, product_description=?, weight=?, 
        manage_stock=?, product_quantity=?, product_status=?, product_visibility=?, 
        url_key=?, stock_availability=?, business_id=?, category_id=?
        WHERE product_id=?`,
      [
        product_name, sku, product_price, product_description, weight,
        manage_stock, product_quantity, product_status, product_visibility,
        url_key, stock_availability, business_id, category_id, id,
      ]
    );

    await conn.query('DELETE FROM product_size WHERE product_id = ?', [id]);
    await conn.query('DELETE FROM product_color WHERE product_id = ?', [id]);

    for (const attr of parsedAttributes) {
      const [colorResult] = await conn.query(
        `INSERT INTO product_color (
          product_id, color_name, color_code
        ) VALUES (?, ?, ?)`,
        [id, attr.color_name, attr.color_hex]
      );
      
      const color_id = colorResult.insertId;
      
      for (const size of attr.sizes) {
        await conn.query(
          `INSERT INTO product_size (
            product_id, color_id, size, quantity
          ) VALUES (?, ?, ?, ?)`,
          [id, color_id, size.size, size.quantity]
        );
      }
    }

    if (removedImages) {
      const parsed = JSON.parse(removedImages);
      for (const imageUrl of parsed) {
        const relativePath = imageUrl.replace(`${process.env.BACKEND_URL || "http://localhost:8080"}`, "");
        const imagePath = path.join(__dirname, "..", relativePath);
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.warn("File not found or couldn't delete:", imagePath);
        }
        await conn.query("DELETE FROM product_images WHERE product_id = ? AND image_url = ?", [id, relativePath]);
      }
    }

    if (req.files && req.files.length > 0) {
      const imageInsertValues = req.files.map(file => [id, `http://localhost:8080/uploads/products/${file.filename}`]);
      await conn.query("INSERT INTO product_images (product_id, image_url) VALUES ?", [imageInsertValues]);
    }

    // if (removedImages) {
    //   const parsed = JSON.parse(removedImages);
    //   for (const imageUrl of parsed) {
    //     await deleteFromS3(imageUrl);
    //     await conn.query("DELETE FROM product_images WHERE product_id = ? AND image_url = ?", [id, imageUrl]);
    //   }
    // }

    // if (req.files && req.files.length > 0) {
    //   const imageUrls = await Promise.all(
    //     req.files.map(file => uploadToS3(file, 'products'))
    //   );
    //   const imageInsertValues = imageUrls.map(url => [id, url]);
    //   await conn.query("INSERT INTO product_images (product_id, image_url) VALUES ?", [imageInsertValues]);
    // }


    await conn.commit();
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to update product" });
  } finally {
    conn.release();
  }
});

module.exports = router;