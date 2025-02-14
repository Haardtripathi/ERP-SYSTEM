const express = require('express');
const router = express.Router();
const returnController = require("../controllers/section5/returnControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");


router.get('/get-return-data', isAuthenticated, returnController.getAllReturnData);



module.exports = router;