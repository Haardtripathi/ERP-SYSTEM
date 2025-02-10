
const express = require('express');
const router = express.Router();
const confirmedController = require("../controllers/section2/confirmedControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");

const upload = multer();



router.get('/get-confirmed-data', isAuthenticated, confirmedController.getAllConfirmedData);

router.put("/edit-awbnumber", isAuthenticated, confirmedController.editAwbNumber)

router.put("/handle-state-change", isAuthenticated, confirmedController.handleStateChange)

module.exports = router;