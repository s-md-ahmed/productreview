// Core setup
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Serve static frontend assets first (CSS, client-side JS, etc.)
app.use(express.static(path.join(__dirname, '../frontend')));

// User auth routes
app.use('/api/users', require('./routes/user'));

// Product API routes
app.use('/api/products', require('./routes/products'));

// Frontend HTML page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
