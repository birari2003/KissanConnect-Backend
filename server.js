require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const subscription = require('./routes/subscription');
const farmerRoutes = require('./routes/farmer');
const adminRoutes = require('./routes/admin');

const db = require('./models');  // <-- USE THIS

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Test DB connection
db.sequelize.authenticate()
  .then(() => console.log("✅ MySQL connected successfully"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// Example route
app.get('/', (req, res) => {
  res.send('🚜 Smart Farmer backend is running!');
});

// Routes
app.post('/api/', subscription);
app.use('/farmer', farmerRoutes);
app.use('/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
