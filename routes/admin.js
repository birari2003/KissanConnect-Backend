const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

// Farmer management routes
router.get('/farmers-list', isAuth, adminController.getFarmersList);
router.post('/update-status', isAuth, adminController.updateFarmerStatus);

// Super admin management routes
router.post('/assign-super-admin', isAuth, adminController.assignSuperAdmin);
router.get('/super-admins', isAuth, adminController.getSuperAdmins);

// User management routes
router.get('/get-all-users', isAuth, adminController.getUsers);

// Message management routes
router.post('/add-message', isAuth, adminController.addMessage);

// Location management routes
router.get('/locations', isAuth, adminController.getAllLocations);
router.get('/states', isAuth, adminController.getStates);
router.get('/states/:stateId/districts', isAuth, adminController.getDistrictsByState);
router.get('/districts/:districtId/talukas', isAuth, adminController.getTalukasByDistrict);

const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Scheme management routes
router.post('/create-scheme', isAuth, upload.single('attachment'), adminController.createScheme);

// Job Profile management routes
router.post('/create-job', isAuth, upload.single('attachment'), adminController.createJob);
router.put('/update-job/:jobId', isAuth, upload.single('attachment'), adminController.updateJob);
router.delete('/delete-job/:jobId', isAuth, adminController.deleteJob);
router.get('/get-all-jobs', isAuth, adminController.getAllJobsAdmin);
router.get('/my-jobs', isAuth, adminController.getMyJobs);
router.patch('/update-job-status/:jobId', isAuth, adminController.updateJobStatus);

module.exports = router;
