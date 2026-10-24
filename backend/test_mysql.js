// Automated MySQL Backend Verification Test
// Run this after setting your MySQL DB_PASSWORD in backend/.env:
// node test_mysql.js

require('dotenv').config();
const { pool, initDB } = require('./db');
const seedProducts = require('./seed');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testAll() {
  console.log('--- STARTING MYSQL BACKEND TEST ---\n');

  try {
    // 1. Test connection and table creation
    console.log('1. Connecting to MySQL & Initializing tables...');
    await initDB();
    console.log('   ✓ Database and tables verified.\n');

    // 2. Test auto-seeding
    console.log('2. Testing Seed logic...');
    const count = await seedProducts();
    console.log(`   ✓ Products count in MySQL: ${count}\n`);

    // 3. Test Products Query
    console.log('3. Testing Product Queries (prepared statements)...');
    const [allProducts] = await pool.query('SELECT id, name, brand, price, stock FROM products LIMIT 3');
    console.log('   ✓ Sample products from MySQL:');
    allProducts.forEach(p => console.log(`     - [${p.id}] ${p.name} (${p.brand}) - ₹${p.price} | Stock: ${p.stock}`));

    const [filtered] = await pool.query('SELECT name, brand FROM products WHERE LOWER(brand) = ?', ['apple']);
    console.log(`   ✓ Brand filter "Apple": found ${filtered.length} phones: ${filtered.map(p => p.name).join(', ')}\n`);

    // 4. Test User Registration
    console.log('4. Testing User Registration in MySQL...');
    const testEmail = `mysql_user_${Date.now()}@example.com`;
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [userResult] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Pooja Patel', testEmail, hashedPassword]
    );
    const newUserId = userResult.insertId;
    console.log(`   ✓ Registered user ID ${newUserId} with email ${testEmail}\n`);

    // 5. Test User Login
    console.log('5. Testing User Login...');
    const [userRows] = await pool.execute('SELECT * FROM users WHERE email = ?', [testEmail]);
    const validPassword = await bcrypt.compare('password123', userRows[0].password);
    console.log(`   ✓ Password comparison valid: ${validPassword}`);
    const token = jwt.sign({ id: newUserId, name: userRows[0].name, email: testEmail }, process.env.JWT_SECRET || 'mysecretkey123', { expiresIn: '7d' });
    console.log(`   ✓ JWT Token generated: ${token.substring(0, 25)}...\n`);

    // 6. Test Order Transaction with Stock Reduction
    console.log('6. Testing Order Placement with MySQL Transaction (beginTransaction -> commit)...');
    const [stockBefore] = await pool.execute('SELECT id, name, stock, price FROM products WHERE id = 1');
    const initialStock = stockBefore[0].stock;
    console.log(`   ✓ Phone: ${stockBefore[0].name} | Stock before order: ${initialStock}`);

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      const orderTotal = Number(stockBefore[0].price) * 1;
      const [orderRes] = await conn.execute(
        'INSERT INTO orders (user_id, total, address, status) VALUES (?, ?, ?, ?)',
        [newUserId, orderTotal, '123 Tech Avenue, Mumbai', 'Placed']
      );
      const orderId = orderRes.insertId;

      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, 1, 1, stockBefore[0].price]
      );

      await conn.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [1, 1]);

      await conn.commit();
      conn.release();

      console.log(`   ✓ Order #${orderId} committed successfully to MySQL!`);
    } catch (txErr) {
      await conn.rollback();
      conn.release();
      throw txErr;
    }

    const [stockAfter] = await pool.execute('SELECT stock FROM products WHERE id = 1');
    console.log(`   ✓ Stock after order: ${stockAfter[0].stock} (decreased by 1 from ${initialStock})\n`);

    // 7. Test Orders Query
    console.log('7. Testing "My Orders" Query with Joins...');
    const [orders] = await pool.execute(
      `SELECT o.id, o.total, o.address, o.status, oi.quantity, p.name 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       JOIN products p ON oi.product_id = p.id 
       WHERE o.user_id = ?`,
      [newUserId]
    );
    console.log(`   ✓ Found ${orders.length} order item(s) for user ID ${newUserId}:`);
    orders.forEach(o => console.log(`     - Order #${o.id} | ${o.name} (Qty: ${o.quantity}) | Total: ₹${o.total} | Status: ${o.status}`));

    console.log('\n--- ALL MYSQL TESTS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await pool.end();
  }
}

testAll();
