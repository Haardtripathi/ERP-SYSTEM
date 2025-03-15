const express = require('express');
const { isAuthenticated } = require("../middlewares/authMiddleware")
const { getPermissions } = require("../controllers/roleControllers")

const router = express.Router();
router.get("/permissions", isAuthenticated, getPermissions);


module.exports = router;
