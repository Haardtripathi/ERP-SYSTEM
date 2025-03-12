const express = require('express');
const adminController = require('../controllers/adminControllers');
const { isAdmin } = require("../middlewares/adminMiddleware");
const { isAuthenticated } = require("../middlewares/authMiddleware")
const { addRole, getPagesAndColumns, getAllRoles, getPermissions } = require("../controllers/adminControllers");
const { checkPermission } = require("../middlewares/permissionMiddleware")

const router = express.Router();

router.get('/get-all-user-data', isAuthenticated, isAdmin, adminController.getAllUserData);
router.get('/edit-user-data/:id', isAuthenticated, isAdmin, adminController.getUserById);

router.post('/edit-user', isAdmin, adminController.editUserData);


router.post("/add-role", isAuthenticated, isAdmin, addRole);
router.get("/roles", isAuthenticated, isAdmin, getAllRoles);

router.get("/pages", isAuthenticated, isAdmin, getPagesAndColumns);
router.get("/permissions", isAuthenticated, getPermissions);



module.exports = router;
