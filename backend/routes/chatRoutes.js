const express = require('express');
const router = express.Router();

// Middlewares
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

// Controllers
const groupChatController = require('../controllers/chat/groupChatControllers');
const oneOnOneChatController = require('../controllers/chat/oneOnOneChatControllers'); // ✅ matches filename



// ==== Group Chat Routes ====
router.post('/group/create', isAuthenticated, isAdmin, groupChatController.createGroup);
router.post('/group/:groupId/add-member', isAuthenticated, isAdmin, groupChatController.addMember);
router.post('/group/:groupId/remove-member', isAuthenticated, isAdmin, groupChatController.removeMember);
router.get('/group/:groupId', isAuthenticated, groupChatController.getGroupDetails);
router.post('/group/:groupId/leave', isAuthenticated, groupChatController.leaveGroup);
router.post('/group/:groupId/pin-message', isAuthenticated, isAdmin, groupChatController.pinMessage);

// ==== One-on-One Chat Routes ====
router.post('/one-on-one/create', isAuthenticated, isAdmin, oneOnOneChatController.createOneOnOneChat);
router.get('/one-on-one/:chatId', isAuthenticated, oneOnOneChatController.getOneOnOneChat);
router.get('/one-on-one/:chatId/messages', isAuthenticated, oneOnOneChatController.getOneOnOneMessages);

module.exports = router;