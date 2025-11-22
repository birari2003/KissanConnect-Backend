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

module.exports = router;
