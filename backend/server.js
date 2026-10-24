// Online Mobile Store - Backend Server (MySQL Version)
// Industrial Training Project

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Database & Seed setup
const { initDB } = require('./db');
const seedProducts = require('./seed');

// Import Route Handlers
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MySQL' });
});

// Mount API Routes
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);

// Welcome route
app.get('/', (req, res) => {
  res.send('Online Mobile Store Backend API (MySQL) is running!');
});

// Asynchronously initialize MySQL and start listening
async function startServer() {
  try {
    await initDB();
    const productCount = await seedProducts();
    console.log(`${productCount} products in database`);
  } catch (err) {
    console.warn('\n⚠️ [Notice] Could not auto-initialize MySQL database on startup.');
    console.warn('Please make sure MySQL is running and update DB_PASSWORD in backend/.env with your password.\n');
  }

  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Handle port in use error gracefully
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is currently in use. Please wait 2 seconds or restart nodemon.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
