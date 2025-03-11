const express = require('express');
const router = express.Router();
const leadController = require("../controllers/section1/leadControllers")
const { isAuthenticated } = require("../middlewares/authMiddleware")
const multer = require("multer");
const { checkPermission } = require("../middlewares/permissionMiddleware")
const upload = multer();


router.post("/add-lead-data", isAuthenticated, checkPermission, upload.single("file"), leadController.postAddLeadData)

router.get('/get-lead-data', isAuthenticated, checkPermission, leadController.getAllLeadData);

router.put('/delete-lead-data/:id', isAuthenticated, checkPermission, leadController.deleteLeadData);

router.get('/get-lead-dropdown-data', isAuthenticated, checkPermission, leadController.getLeadDropdownData)

router.get('/get-edit-lead-data/:id', isAuthenticated, checkPermission, leadController.getEditLeadData)

router.put('/edit-lead-data/:id', isAuthenticated, checkPermission, leadController.putEditLeadData);

router.post('/send-lead-data-to-pending/:id', isAuthenticated, checkPermission, leadController.sendLeadDataToPending);

module.exports = router;
