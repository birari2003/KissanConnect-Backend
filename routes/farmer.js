const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmer');
const isAuth = require('../middleware/is-auth');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/add-user', farmerController.addUser);
router.post('/login', farmerController.loginUser);

router.post('/register-farmer', isAuth, upload.single('passport_photo'), farmerController.registerFarmer);
router.get('/request-status', isAuth, farmerController.getRequestStatus);
router.get('/get-farmer-profile', isAuth, farmerController.getFarmerProfile);
router.get('/get-messages', isAuth, farmerController.getMessages);

// Email route - no auth required for contact form
router.post('/send-email', farmerController.sendEmail);

// Job routes
router.get('/get-jobs', isAuth, farmerController.getJobs);
router.get('/get-job/:jobId', isAuth, farmerController.getJobById);

// Crop Sell routes
router.post('/add-crop', isAuth, upload.array('photos', 5), farmerController.addCrop);
router.get('/get-crops', isAuth, farmerController.getCrops);
router.get('/get-all-crops', isAuth, farmerController.getAllCrops);

// Crop Claim routes
router.post('/add-claim', isAuth, upload.single('evidence'), farmerController.addCropClaim);
router.get('/get-claims', isAuth, farmerController.getClaims);

// Government Scheme routes
router.get('/get-schemes', isAuth, farmerController.getGovernmentSchemes);

module.exports = router;
