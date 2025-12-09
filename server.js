require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const subscription = require('./routes/subscription');
const farmerRoutes = require('./routes/farmer');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

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
app.use('/payment', paymentRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



// import express from "express";
// import Razorpay from "razorpay";
// import cors from "cors";
// import bodyParser from "body-parser";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // Razorpay instance
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // API to open payment screen
// app.get("/pay", async (req, res) => {
//     try {
//         const options = {
//             amount: 100 * 100,   // 100 INR (convert to paise)
//             currency: "INR",
//             receipt: "order_rcptid_11",
//         };

//         const order = await razorpay.orders.create(options);

//         const paymentPage = `
//             <html>
//             <body>
//                 <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
//                 <script>
//                     var options = {
//                         "key": "${process.env.RAZORPAY_KEY_ID}",
//                         "amount": "${order.amount}",
//                         "currency": "INR",
//                         "name": "Test Payment",
//                         "description": "Demo",
//                         "order_id": "${order.id}",
//                         "handler": function (response){
//                             alert("Payment Successful: " + response.razorpay_payment_id);
//                         },
//                         "prefill": {
//                             "name": "Gaurav",
//                             "email": "gaurav@test.com",
//                             "contact": "9999999999"
//                         },
//                         "theme": {
//                             "color": "#3399cc"
//                         }
//                     };
//                     var rzp1 = new Razorpay(options);
//                     rzp1.open();
//                 </script>
//             </body>
//             </html>
//         `;
        
//         res.send(paymentPage);

//     } catch (error) {
//         console.log(error);
//         res.status(500).send("Something went wrong");
//     }
// });

// app.listen(5000, () => {
//     console.log("Server running on port 5000");
// });
