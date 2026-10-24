// Orders Routes (MySQL with transactions)
// Industrial Training Project

const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

// POST /api/orders
// Places an order using a MySQL transaction (Login required)
// Request body: { items: [{ productId: 1, quantity: 2 }], address: "123 Main St" }
router.post('/', authMiddleware, async (req, res) => {
  const { items, address } = req.body;
  const userId = req.user.id;

  // Validate address
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return res.status(400).json({ error: 'Delivery address is required' });
  }

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  let connection;

  try {
    // Acquire dedicated connection from the pool for transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let calculatedTotal = 0;
    const verifiedItems = [];

    // Verify each item and check live stock inside the transaction
    for (const item of items) {
      const productId = parseInt(item.productId, 10);
      const quantity = parseInt(item.quantity, 10);

      if (isNaN(productId) || isNaN(quantity) || quantity <= 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: 'Each item must have a valid productId and quantity greater than 0' });
      }

      const [rows] = await connection.execute(
        'SELECT id, name, price, stock FROM products WHERE id = ? FOR UPDATE',
        [productId]
      );

      if (!rows || rows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: `Product with ID ${productId} does not exist` });
      }

      const product = rows[0];

      if (product.stock < quantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${quantity}`
        });
      }

      const itemTotal = Number(product.price) * quantity;
      calculatedTotal += itemTotal;

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: quantity
      });
    }

    // 1. Insert into orders table
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total, address, status) VALUES (?, ?, ?, ?)',
      [userId, calculatedTotal, address.trim(), 'Placed']
    );

    const orderId = orderResult.insertId;

    // 2. Insert into order_items table and reduce product stock
    for (const item of verifiedItems) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );

      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // Commit transaction if all steps succeed
    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: orderId,
      total: calculatedTotal,
      status: 'Placed',
      itemsCount: verifiedItems.length
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Order creation error with MySQL:', error);
    res.status(500).json({ error: 'Failed to place order due to server error' });
  }
});

// GET /api/orders/my
// Retrieves all orders of the logged-in user with their items (Login required)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's orders ordered by newest first
    const [orders] = await pool.execute(
      'SELECT id, user_id, total, address, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.execute(
          `SELECT 
            oi.id,
            oi.product_id,
            oi.quantity,
            oi.price,
            p.name AS product_name,
            p.brand AS product_brand,
            p.image AS product_image
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?`,
          [order.id]
        );

        return {
          ...order,
          total: Number(order.total),
          items: items.map(i => ({ ...i, price: Number(i.price) }))
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching user orders from MySQL:', error);
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
});

// GET /api/orders/all (Admin: View all customer orders)
router.get('/all', async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT 
        o.id, 
        o.user_id, 
        o.total, 
        o.address, 
        o.status, 
        o.created_at, 
        u.name AS customer_name, 
        u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
    `);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.execute(
          `SELECT 
            oi.id,
            oi.product_id,
            oi.quantity,
            oi.price,
            p.name AS product_name,
            p.brand AS product_brand,
            p.image AS product_image
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?`,
          [order.id]
        );

        return {
          ...order,
          total: Number(order.total),
          items: items.map(i => ({ ...i, price: Number(i.price) }))
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching all orders for admin:', error);
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// PUT /api/orders/:id/status (Admin: Change order status)
router.put('/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(orderId) || !status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Valid order ID and status string are required' });
    }

    const [result] = await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status.trim(), orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', status: status.trim() });
  } catch (error) {
    console.error('Error updating order status in MySQL:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
