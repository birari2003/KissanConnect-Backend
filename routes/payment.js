const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const isAuth = require('../middleware/is-auth');

router.post('/create-order', isAuth, paymentController.createOrder);
router.post('/verify-payment', isAuth, paymentController.verifyPayment);

module.exports = router;
