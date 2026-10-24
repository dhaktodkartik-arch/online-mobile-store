// Authentication Routes (Register & Login) - MySQL Version
// Industrial Training Project

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

// POST /api/auth/register
// Registers a new user with hashed password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password with bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into MySQL database
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: cleanEmail
      }
    });
  } catch (error) {
    console.error('Registration error with MySQL:', error);
    res.status(500).json({ error: 'Registration failed due to server error' });
  }
});

// POST /api/auth/login
// Verifies user credentials and returns a JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const [rows] = await pool.execute('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    // Verify password with bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'mysecretkey123';
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer'
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer'
      }
    });
  } catch (error) {
    console.error('Login error with MySQL:', error);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
});

module.exports = router;
