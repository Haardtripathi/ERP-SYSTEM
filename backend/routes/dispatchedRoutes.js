
const express = require('express');
const router = express.Router();
const dispatchedController = require("../controllers/section4/dispatchedControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");


router.get('/get-dispatched-data', isAuthenticated, dispatchedController.getAllDispatchedData);

router.put('/put-dispatched-data', isAuthenticated, dispatchedController.dispatchedData);

router.put('/update-position/:id', isAuthenticated, dispatchedController.updatePosition);

router.put('/return-data', isAuthenticated, dispatchedController.returnData);

router.post('/raise-complain', isAuthenticated, dispatchedController.raiseComplain);

router.post('/delivered', isAuthenticated, dispatchedController.deliverItem);



module.exports = router;