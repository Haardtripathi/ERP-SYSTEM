const express = require('express');
const router = express.Router();
const sheetController = require("../controllers/section3/sheetControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")



// router.post("/add-pending-data", isAuthenticated, upload.single("file"), pendingController.postAddpendingData)

router.get('/get-sheet-data', isAuthenticated, sheetController.getAllSheetData);

module.exports = router