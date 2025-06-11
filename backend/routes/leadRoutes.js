const express = require('express');
const router = express.Router();
const leadController = require("../controllers/section1/leadControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");
const { checkPermission } = require("../middlewares/permissionMiddleware")
const upload = multer();


router.post("/add-lead-data", isAuthenticated, upload.single("file"), leadController.postAddLeadData)

router.get('/get-lead-data', isAuthenticated, leadController.getAllLeadData);

router.put('/delete-lead-data/:id', isAuthenticated, leadController.deleteLeadData);

router.get('/get-lead-dropdown-data', isAuthenticated, leadController.getLeadDropdownData)

router.get('/get-edit-lead-data/:id', isAuthenticated, leadController.getEditLeadData)

router.put('/edit-lead-data/:id', isAuthenticated, leadController.putEditLeadData);

router.post('/send-lead-data-to-pending/:id', isAuthenticated, leadController.sendLeadDataToPending);

module.exports = router;
