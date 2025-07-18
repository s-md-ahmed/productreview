// Core setup
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
// User auth routes
// 👇 FIX THIS in server.js
app.use('/api/users', require('./routes/user'));


// Product API
app.use('/api/products', require('./routes/products'));
// Register page = /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

// Login page = /login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Home page = /home
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.use(express.static(path.join(__dirname, '../frontend')));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
