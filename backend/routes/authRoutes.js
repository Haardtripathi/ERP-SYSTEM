const express = require('express');
const { register, login, checkAuth, getAgentList } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/checkAuth', checkAuth);
router.get('/agentList', getAgentList);

module.exports = router;
