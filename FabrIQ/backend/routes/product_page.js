const express = require('express');
const router = express.Router();
const pool = require('../db');

//Local Database
// router.get('/', async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 12,
//       search = '',
//       category = '',
//       minPrice = 0,
//       maxPrice = 100000,
//       sort = 'newest'
//     } = req.query;

//     const offset = (page - 1) * limit;

//     let query = `
//       SELECT 
//         p.*, 
//         sc.category_id AS subcategory_id,
//         sc.category_name AS subcategory_name,
//         pc.category_id AS parent_category_id,
//         pc.category_name AS parent_category_name,
//         COUNT(*) OVER() AS total_count
//       FROM products p
//       LEFT JOIN categories sc ON p.category_id = sc.category_id
//       LEFT JOIN categories pc ON sc.parent_category_id = pc.category_id
//       WHERE p.product_price BETWEEN ? AND ?
//       AND p.product_visibility != 'not_visible'
//     `;

//     const queryParams = [minPrice, maxPrice];

//     if (search) {
//       query += ` AND (p.product_name LIKE ? OR p.product_description LIKE ?)`;
//       queryParams.push(`%${search}%`, `%${search}%`);
//     }

//     if (category) {
//       query += ` AND p.category_id = ?`;
//       queryParams.push(category);
//     }

//     switch (sort) {
//       case 'price-low':
//         query += ` ORDER BY p.product_price ASC`;
//         break;
//       case 'price-high':
//         query += ` ORDER BY p.product_price DESC`;
//         break;
//       case 'newest':
//         query += ` ORDER BY p.created_at DESC`;
//         break;
//       case 'popular':
//         query += ` ORDER BY p.view_count DESC`;
//         break;
//       default:
//         query += ` ORDER BY p.created_at DESC`;
//     }

//     query += ` LIMIT ? OFFSET ?`;
//     queryParams.push(parseInt(limit), parseInt(offset));

//     const conn = await pool.getConnection();
//     const [products] = await conn.query(query, queryParams);

//     if (products.length === 0) {
//       conn.release();
//       return res.json({
//         products: [],
//         total: 0,
//         totalPages: 0
//       });
//     }

//     const totalCount = products[0].total_count;
//     const totalPages = Math.ceil(totalCount / limit);

//     const productIds = products.map((p) => p.product_id);

//     const [images] = await conn.query(
//       'SELECT product_id, image_url FROM product_images WHERE product_id IN (?)',
//       [productIds]
//     );

//     const imagesMap = {};
//     images.forEach((img) => {
//       if (!imagesMap[img.product_id]) {
//         imagesMap[img.product_id] = [];
//       }
//       imagesMap[img.product_id].push(img.image_url);
//     });

//     const finalProducts = products.map((p) => ({
//       id: p.product_id,
//       name: p.product_name,
//       price: p.product_price,
//       description: p.product_description,
//       stock: p.product_quantity,
//       color: p.color,
//       size: p.size,
//       urlKey: p.url_key,
//       created_at: p.created_at,
//       categoryId: p.category_id,

//       category: {
//         id: p.parent_category_id || p.subcategory_id || null,
//         name: p.parent_category_name || p.subcategory_name || null,
//         subcategories: p.subcategory_id ? [
//           {
//             id: p.subcategory_id,
//             name: p.subcategory_name
//           }
//         ] : []
//       },
//       images: imagesMap[p.product_id] || [],
//     }));

//     conn.release();

//     res.json({
//       products: finalProducts,
//       total: totalCount,
//       totalPages: totalPages
//     });
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

//Online Database
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      minPrice = 0,
      maxPrice = 100000,
      sort = 'newest'
    } = req.query;

    const offset = (page - 1) * limit;

    let baseWhere = `WHERE p.product_price BETWEEN ? AND ? AND p.product_visibility != 'not_visible'`;
    const queryParams = [minPrice, maxPrice];
    const countParams = [...queryParams];

    if (search) {
      baseWhere += ` AND (p.product_name LIKE ? OR p.product_description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      baseWhere += ` AND p.category_id = ?`;
      queryParams.push(category);
      countParams.push(category);
    }

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories sc ON p.category_id = sc.category_id
      LEFT JOIN categories pc ON sc.parent_category_id = pc.category_id
      ${baseWhere}
    `;

    let query = `
      SELECT 
        p.*, 
        sc.category_id AS subcategory_id,
        sc.category_name AS subcategory_name,
        pc.category_id AS parent_category_id,
        pc.category_name AS parent_category_name
      FROM products p
      LEFT JOIN categories sc ON p.category_id = sc.category_id
      LEFT JOIN categories pc ON sc.parent_category_id = pc.category_id
      ${baseWhere}
    `;

    switch (sort) {
      case 'price-low':
        query += ` ORDER BY p.product_price ASC`;
        break;
      case 'price-high':
        query += ` ORDER BY p.product_price DESC`;
        break;
      case 'popular':
        query += ` ORDER BY p.view_count DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY p.created_at DESC`;
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const conn = await pool.getConnection();
    const [[{ total: totalCount }]] = await conn.query(countQuery, countParams);
    const totalPages = Math.ceil(totalCount / limit);

    const [products] = await conn.query(query, queryParams);

    if (!products.length) {
      conn.release();
      return res.json({ products: [], total: 0, totalPages: 0 });
    }

    const productIds = products.map(p => p.product_id);
    const [images] = await conn.query(
      `SELECT product_id, image_url FROM product_images WHERE product_id IN (?)`,
      [productIds]
    );

    const imagesMap = {};
    images.forEach((img) => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_url);
    });

    const finalProducts = products.map((p) => ({
      id: p.product_id,
      name: p.product_name,
      price: p.product_price,
      description: p.product_description,
      stock: p.product_quantity,
      color: p.color,
      size: p.size,
      urlKey: p.url_key,
      created_at: p.created_at,
      categoryId: p.category_id,
      category: {
        id: p.parent_category_id || p.subcategory_id || null,
        name: p.parent_category_name || p.subcategory_name || null,
        subcategories: p.subcategory_id
          ? [{ id: p.subcategory_id, name: p.subcategory_name }]
          : []
      },
      images: imagesMap[p.product_id] || [],
    }));

    conn.release();

    res.json({
      products: finalProducts,
      total: totalCount,
      totalPages: totalPages
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:urlKey', async (req, res) => {
  const { urlKey } = req.params;
  try {
    const [productRows] = await pool.query(`
      SELECT 
        p.product_id,
        p.product_name,
        p.product_description,
        p.product_price,
        p.product_quantity,
        p.url_key,
        p.business_id,
        c.category_id,
        c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.url_key = ? AND p.product_status = 'enabled'
    `, [urlKey]);

    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productRows[0];

    const [images] = await pool.query(`
      SELECT image_url FROM product_images WHERE product_id = ?
    `, [product.product_id]);

    const [colors] = await pool.query(`
      SELECT 
        color_id,
        color_name,
        color_code
      FROM product_color
      WHERE product_id = ?
    `, [product.product_id]);

    const [sizes] = await pool.query(`
      SELECT 
        ps.size_id,
        ps.size,
        ps.quantity,
        ps.color_id,
        pc.color_name,
        pc.color_code
      FROM product_size ps
      LEFT JOIN product_color pc ON ps.color_id = pc.color_id
      WHERE ps.product_id = ?
      ORDER BY ps.color_id, ps.size
    `, [product.product_id]);

    const [storeInfo] = await pool.query(`
      SELECT 
        business_id,
        business_name,
        business_logo_url,
        average_rating
      FROM businesses 
      WHERE business_id = ?
    `, [product.business_id]);

    // const [reviews] = await pool.query(`
    //   SELECT 
    //     pr.review_id,
    //     pr.rating,
    //     pr.review_text,
    //     pr.review_media,
    //     pr.created_at,
    //     CONCAT(u.first_name, ' ', u.last_name) AS username
    //   FROM product_reviews pr
    //   JOIN users u ON pr.user_id = u.user_id
    //   WHERE pr.product_id = ?
    //   ORDER BY pr.created_at DESC
    // `, [product.product_id]);

    const [reviews] = await pool.query(`
      SELECT 
        pr.review_id,
        pr.rating,
        pr.review_text,
        GROUP_CONCAT(prm.media_url) AS review_media,
        pr.created_at,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS username
        FROM product_reviews pr
        JOIN users u ON pr.user_id = u.user_id
        LEFT JOIN product_reviews_media prm ON pr.review_id = prm.review_id
        WHERE pr.product_id = ?
        GROUP BY pr.review_id, pr.rating, pr.review_text, pr.created_at, u.first_name, u.last_name
        ORDER BY pr.created_at DESC
      `, [product.product_id]);

    const [relatedProducts] = await pool.query(`
      SELECT 
        p.product_id,
        p.product_name,
        p.product_price,
        p.url_key,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.product_id 
          LIMIT 1
        ) AS image,
        (
          SELECT AVG(rating)
          FROM product_reviews
          WHERE product_id = p.product_id
        ) AS average_rating
      FROM products p
      WHERE p.business_id = ?
      AND p.product_id != ?
      AND p.product_status = 'enabled'
      LIMIT 8
    `, [product.business_id, product.product_id]);

    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((total, review) => total + parseFloat(review.rating), 0);
      averageRating = sum / reviews.length;
    }

    const responseData = {
      product: {
        ...product,
        images: images.map(img => img.image_url),
        colors: colors,
        sizes: sizes,
        average_rating: averageRating.toFixed(1)
      },
      storeInfo: storeInfo[0] || null,
      reviews: reviews,
      relatedProducts: relatedProducts.map(p => ({
        ...p,
        images: p.image ? [p.image] : []
      }))
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;