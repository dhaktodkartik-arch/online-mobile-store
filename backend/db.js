// Database configuration using mysql2/promise connection pool
// Industrial Training Project

const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'mobile_store';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;

// Create connection pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and tables
async function initDB() {
  try {
    // 1. Create database if it does not already exist
    const tempConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await tempConnection.end();

    // 2. Create tables using the connection pool
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure role column exists if table was created previously
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'role'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'customer'");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image TEXT,
        ram VARCHAR(50),
        storage VARCHAR(50),
        stock INT DEFAULT 10
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        total DECIMAL(10, 2) NOT NULL,
        address TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Placed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    console.log(`MySQL connected & verified database "${DB_NAME}" and tables.`);
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`\n[MySQL Error] Access denied for user '${DB_USER}'.`);
      console.error(`Please update DB_PASSWORD in backend/.env with your MySQL root password.\n`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`\n[MySQL Error] Could not connect to MySQL at ${DB_HOST}:${DB_PORT}.`);
      console.error(`Make sure MySQL server (or XAMPP) is running on port ${DB_PORT}.\n`);
    } else {
      console.error('MySQL initialization error:', error.message);
    }
    throw error;
  }
}

module.exports = {
  pool,
  initDB
};
