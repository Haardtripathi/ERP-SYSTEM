const express = require('express');
const adminController = require('../controllers/adminControllers');
const router = express.Router();

router.get('/get-all-user-data', adminController.getAllUserData);
router.get('/edit-user-data/:id', adminController.getUserById);

router.post('/edit-user', adminController.editUserData);




module.exports = router;
