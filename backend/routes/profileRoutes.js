const express = require('express');
const router = express.Router();
const profileController = require("../controllers/profileController")
const { isAuthenticated } = require("../middlewares/authMiddleware")



router.get('/get-profile-data', isAuthenticated, profileController.getProfileData);



module.exports = router;