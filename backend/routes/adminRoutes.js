const express = require('express');
const adminController = require('../controllers/adminControllers');
const router = express.Router();

router.get('/get-all-user-data', adminController.getAllUserData);


module.exports = router;
