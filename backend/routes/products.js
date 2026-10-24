// Products Routes (MySQL with mysql2/promise)
// Industrial Training Project

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/products
// Supports query params: ?search=keyword and ?brand=brandName
router.get('/', async (req, res) => {
  try {
    const { search, brand } = req.query;

    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    // Filter by brand if provided
    if (brand && brand.trim() !== '') {
      conditions.push('LOWER(brand) = LOWER(?)');
      params.push(brand.trim());
    }

    // Filter by search keyword (checks product name and description)
    if (search && search.trim() !== '') {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search.trim()}%`);
      params.push(`%${search.trim()}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';

    // Execute prepared statement with pool
    const [products] = await pool.query(query, params);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products from MySQL:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
// Returns a single product by its ID
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Query single product using prepared statement
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product by ID from MySQL:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products (Admin: Add new phone)
router.post('/', async (req, res) => {
  try {
    const { name, brand, price, description, image, ram, storage, stock } = req.body;

    if (!name || !brand || !price) {
      return res.status(400).json({ error: 'Name, brand, and price are required' });
    }

    const defaultImage = image && image.trim() !== '' 
      ? image.trim() 
      : `https://placehold.co/300x300?text=${encodeURIComponent(name.trim())}`;

    const [result] = await pool.execute(
      `INSERT INTO products (name, brand, price, description, image, ram, storage, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        brand.trim(),
        parseFloat(price),
        description ? description.trim() : '',
        defaultImage,
        ram ? ram.trim() : '8GB',
        storage ? storage.trim() : '128GB',
        stock ? parseInt(stock, 10) : 10
      ]
    );

    res.status(201).json({
      message: 'Product added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding product to MySQL:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// PUT /api/products/:id/stock (Admin: Update phone stock)
router.put('/:id/stock', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { stock } = req.body;

    if (isNaN(productId) || stock === undefined || isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0) {
      return res.status(400).json({ error: 'Valid stock number (>= 0) is required' });
    }

    const newStock = parseInt(stock, 10);

    const [result] = await pool.execute(
      'UPDATE products SET stock = ? WHERE id = ?',
      [newStock, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Stock updated successfully', stock: newStock });
  } catch (error) {
    console.error('Error updating stock in MySQL:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// DELETE /api/products/:id (Admin: Delete phone)
router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product from MySQL:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
