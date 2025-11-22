const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmer');
const isAuth = require('../middleware/is-auth');

router.post('/add-user', farmerController.addUser);
router.post('/login', farmerController.loginUser);

router.post('/register-farmer', isAuth, farmerController.registerFarmer);
router.get('/request-status', isAuth, farmerController.getRequestStatus);
router.get('/get-messages', isAuth, farmerController.getMessages);




module.exports = router;
