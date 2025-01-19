const express = require('express');
const router = express.Router();
const pendingController = require("../controllers/section2/pendingControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");

const upload = multer();


// router.post("/add-pending-data", isAuthenticated, upload.single("file"), pendingController.postAddpendingData)

router.get('/get-pending-data', isAuthenticated, pendingController.getAllPendingData);

// router.put('/delete-pending-data/:id', isAuthenticated, pendingController.deletependingData);

// router.get('/get-pending-dropdown-data', isAuthenticated, pendingController.getpendingDropdownData)

router.get('/get-edit-pending-data/:id', isAuthenticated, pendingController.getEditPendingData)

// router.put('/edit-pending-data/:id', isAuthenticated, pendingController.putEditpendingData);

// router.post('/send-pending-data-to-pending/:id', isAuthenticated, pendingController.sendpendingDataToPending);

module.exports = router;
