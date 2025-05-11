const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT category_id, category_name, parent_category_id FROM categories');

    const categoriesMap = {};

    categories.forEach((cat) => {
      if (!cat.parent_category_id) {
        categoriesMap[cat.category_id] = {
          id: cat.category_id,
          name: cat.category_name,
          subcategories: [],
        };
      }
    });

    categories.forEach((cat) => {
      if (cat.parent_category_id && categoriesMap[cat.parent_category_id]) {
        categoriesMap[cat.parent_category_id].subcategories.push({
          id: cat.category_id,
          name: cat.category_name,
        });
      }
    });

    const categoriesWithSub = Object.values(categoriesMap);

    res.json(categoriesWithSub);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
