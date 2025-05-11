const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

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

router.post('/add', authenticateToken, async (req, res) => {
  const { productId, quantity, size, colorId } = req.body;
  const userId = req.user.id;

  try {
    if (!productId || !quantity || !size) {
      return res.status(400).json({ message: 'Product ID, quantity, and size are required' });
    }

    const [productSizes] = await db.query(`
      SELECT s.size_id 
      FROM product_size s
      JOIN products p ON s.product_id = p.product_id
      WHERE p.product_id = ? AND s.size = ?
      ${colorId ? 'AND s.color_id = ?' : ''}
    `, colorId ? [productId, size, colorId] : [productId, size]);

    if (productSizes.length === 0) {
      return res.status(404).json({ message: 'Product size not found' });
    }

    // const [availability] = await db.query(`
    //   SELECT stock_quantity 
    //   FROM product_size 
    //   WHERE size_id = ?
    //   `, [sizeId]);

    // if (availability.length === 0 || availability[0].stock_quantity < quantity) {
    //   return res.status(400).json({ 
    //   message: 'Not enough stock available',
    //   available: availability[0]?.stock_quantity || 0
    //   });
    // }

    const sizeId = productSizes[0].size_id;

    const [userCart] = await db.query('SELECT cart_id FROM cart WHERE user_id = ?', [userId]);

    let cartId;
    if (userCart.length === 0) {
      const [result] = await db.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
      cartId = result.insertId;
    } else {
      cartId = userCart[0].cart_id;
    }

    const [existingItem] = await db.query(`
      SELECT cart_item_id, quantity 
      FROM cart_items 
      WHERE cart_id = ? AND size_id = ?
    `, [cartId, sizeId]);

    if (existingItem.length > 0) {
      const newQuantity = existingItem[0].quantity + quantity;
      await db.query(`
        UPDATE cart_items 
        SET quantity = ? 
        WHERE cart_item_id = ?
      `, [newQuantity, existingItem[0].cart_item_id]);
    } else {
      await db.query(`
        INSERT INTO cart_items (cart_id, size_id, quantity) 
        VALUES (?, ?, ?)
      `, [cartId, sizeId, quantity]);
    }

    res.status(200).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

router.get('/items', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [cart] = await db.query('SELECT cart_id FROM cart WHERE user_id = ?', [userId]);
    if (cart.length === 0) {
      return res.json([]);
    }

    const cartId = cart[0].cart_id;

    const [items] = await db.query(`
      SELECT 
        ci.cart_item_id,
        ci.quantity,
        p.product_id,
        p.product_name,
        p.product_price,
        pi.image_url,
        pc.color_id,
        pc.color_name,
        pc.color_code,
        ps.size_id,
        ps.size
      FROM cart_items ci
      JOIN product_size ps ON ci.size_id = ps.size_id
      JOIN products p ON ps.product_id = p.product_id
      JOIN product_color pc ON ps.color_id = pc.color_id
      LEFT JOIN (
        SELECT product_id, MIN(image_url) as image_url 
        FROM product_images 
        GROUP BY product_id
      ) pi ON p.product_id = pi.product_id
      WHERE ci.cart_id = ?
    `, [cartId]);

    res.json(items);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Failed to fetch cart items' });
  }
});

router.put('/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    await db.query('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [quantity, itemId]);
    res.json({ message: 'Quantity updated' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
});

router.delete('/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    await db.query('DELETE FROM cart_items WHERE cart_item_id = ?', [itemId]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Failed to remove cart item' });
  }
});

router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [cart] = await db.query('SELECT cart_id FROM cart WHERE user_id = ?', [userId]);
    if (cart.length > 0) {
      const cartId = cart[0].cart_id;
      await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    }
    
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

router.get('/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [cart] = await db.query('SELECT cart_id FROM cart WHERE user_id = ?', [userId]);
    if (cart.length === 0) {
      return res.json({ count: 0 });
    }

    const cartId = cart[0].cart_id;

    const [result] = await db.query(`
      SELECT SUM(quantity) as total 
      FROM cart_items 
      WHERE cart_id = ?
    `, [cartId]);

    const count = result[0].total || 0;
    res.json({ count });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    res.status(500).json({ message: 'Failed to fetch cart count' });
  }
});

module.exports = router;