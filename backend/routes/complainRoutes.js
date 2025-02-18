const express = require('express');
const router = express.Router();
const complainController = require("../controllers/section4/complainControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");


router.get('/get-complain-data', isAuthenticated, complainController.getAllComplainData);



module.exports = router;