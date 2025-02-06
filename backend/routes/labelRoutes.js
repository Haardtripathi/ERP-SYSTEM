const express = require('express');
const router = express.Router();
const labelController = require("../controllers/section3/labelControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");

const upload = multer();


// router.post("/add-pending-data", isAuthenticated, upload.single("file"), pendingController.postAddpendingData)

router.get('/get-label-data', isAuthenticated, labelController.getAllLabelData);

module.exports = router