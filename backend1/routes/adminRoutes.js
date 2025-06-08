const express = require('express');
const adminController = require('../controllers/adminControllers');
const { isAdmin } = require("../middlewares/adminMiddleware");

const router = express.Router();

router.get('/get-all-user-data', isAdmin, adminController.getAllUserData);
router.get('/edit-user-data/:id', isAdmin, adminController.getUserById);

router.post('/edit-user', isAdmin, adminController.editUserData);




module.exports = router;
