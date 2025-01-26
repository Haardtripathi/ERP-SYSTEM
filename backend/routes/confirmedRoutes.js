
const express = require('express');
const router = express.Router();
const confirmedController = require("../controllers/section2/confirmedControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");

const upload = multer();



router.get('/get-confirmed-data', isAuthenticated, confirmedController.getAllConfirmedData);
module.exports = router;