const express = require('express');
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/config.json')['development'];
const nodemailer = require('nodemailer');
const subscription = require('./routes/subscription')
// const subscription = require('./routes/subscription')
// const whatsappRoutes = require("./routes/whatsappRoute");
const farmerRoutes = require('./routes/farmer');
const adminRoutes = require('./routes/admin');


// const { initializeWhatsAppClient } = require('./whatsapp-service'); 

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));






// Initialize Sequelize using your config file
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false, // optional, hides SQL logs
  }
);

// Test DB connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
})();



// Example route
app.get('/', (req, res) => {
  res.send('🚜 Smart Farmer backend is running!');
});

app.post('api/', subscription);
// app.post('api/', subscription);
// app.use("/api/whatsapp", whatsappRoutes); 
app.use('/farmer', farmerRoutes);
app.use('/admin', adminRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  // initializeWhatsAppClient(); 
});
