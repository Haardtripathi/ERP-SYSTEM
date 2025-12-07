const express = require('express');
const { register, login, checkAuth, getAgentList, resetAdminPassword } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/checkAuth', checkAuth);
router.get('/agentList', getAgentList);
router.post('/reset-admin-password', resetAdminPassword);

module.exports = router;
