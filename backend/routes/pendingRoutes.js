const express = require('express');
const router = express.Router();
const pendingController = require("../controllers/section2/pendingControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")


// router.post("/add-pending-data", isAuthenticated, upload.single("file"), pendingController.postAddpendingData)

router.get('/get-pending-data', isAuthenticated, pendingController.getAllPendingData);
router.get('/get-dropdown-data', isAuthenticated, pendingController.getDropdownData);


router.post('/delete-pending-data/:id', isAuthenticated, pendingController.deletePendingData);

// router.get('/get-pending-dropdown-data', isAuthenticated, pendingController.getpendingDropdownData)

router.get('/get-edit-pending-data/:id', isAuthenticated, pendingController.getEditPendingData)

router.put('/edit-pending-data/:id', isAuthenticated, pendingController.putEditPendingData);

router.post('/issue-pending-data/:id', isAuthenticated, pendingController.issuePendingData);


router.post('/send-pending-data-to-confirmed/:id', isAuthenticated, pendingController.sendPendingDataToConfirmed);

module.exports = router;
