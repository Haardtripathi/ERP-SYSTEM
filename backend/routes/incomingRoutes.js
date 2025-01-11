const express = require('express');
const router = express.Router();
const incomingController = require("../controllers/section1/incomingControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")

router.get("/get-add-incoming-data", isAuthenticated, incomingController.getAddIncomingData)

router.post('/add-incoming-data', isAuthenticated, incomingController.postAddIncomingData);

router.get('/get-incoming-data', isAuthenticated, incomingController.getAllIncomingData);

router.get('/edit-incoming-data/:id', isAuthenticated, incomingController.getEditIncomingData);

router.put('/edit-incoming-data/:id', isAuthenticated, incomingController.putEditIncomingData);

router.put('/delete-incoming-data/:id', isAuthenticated, incomingController.deleteIncomingData);

router.post('/send-incoming-data-to-pending/:id', isAuthenticated, incomingController.sendIncomingDataToPending);



module.exports = router;
