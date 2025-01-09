const express = require('express');
const router = express.Router();
const workbookController = require("../controllers/section1/workbookControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")

router.get('/get-workbook-data', isAuthenticated, workbookController.getAllWorkbookData);

module.exports = router;
