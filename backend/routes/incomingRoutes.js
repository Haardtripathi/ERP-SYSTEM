const express = require('express');
const router = express.Router();
const incomingController = require("../controllers/section1/incomingControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")

router.get("/get-add-incoming-data", isAuthenticated, incomingController.getAddIncomingData)

router.post('/add-incoming-data', isAuthenticated, incomingController.postAddIncomingData);

router.get('/get-incoming-data', isAuthenticated, incomingController.getAllIncomingData);


module.exports = router;
