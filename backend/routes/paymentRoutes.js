const express = require('express');
const router = express.Router();
const paymentController = require("../controllers/section5/paymentControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")



router.get('/get-payment-data', isAuthenticated, paymentController.getAllPaymentData);

router.post('/add-payment', isAuthenticated, paymentController.addPayment);




module.exports = router;