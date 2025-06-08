const express = require('express');
const { register, login, checkAuth } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/checkAuth', checkAuth);

module.exports = router;
