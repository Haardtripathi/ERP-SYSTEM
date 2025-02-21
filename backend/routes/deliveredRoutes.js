
const express = require('express');
const router = express.Router();
const deliveredController = require("../controllers/section5/deliveredControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");


router.get('/delivered-data', isAuthenticated, deliveredController.getAllDeliveredData);


module.exports = router;