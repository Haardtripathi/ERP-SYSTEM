const express = require('express');
const router = express.Router();

// Middlewares
const isAuthenticated = require('../middlewares/isAuthenticatedMiddleware');
const isAdmin = require('../middlewares/isAdminMiddleware');

// Import controllers
const groupChatController = require('../controllers/chat/groupChatControllers');
const oneOnOneChatController = require('../controllers/chat/oneOnOneChatControllers');

// ==== Group Chat Routes ====
// Create a group (admin only)
router.post('/group/create', isAuthenticated, isAdmin, groupChatController.createGroup);

// Add a member to a group (admin only)
router.post('/group/:groupId/add-member', isAuthenticated, isAdmin, groupChatController.addMember);

// Remove a member from a group (admin only)
router.post('/group/:groupId/remove-member', isAuthenticated, isAdmin, groupChatController.removeMember);

// Get group details (authenticated users)
router.get('/group/:groupId', isAuthenticated, groupChatController.getGroupDetails);

// Leave a group (any authenticated user)
router.post('/group/:groupId/leave', isAuthenticated, groupChatController.leaveGroup);

// Pin a message in a group (admin only)
router.post('/group/:groupId/pin-message', isAuthenticated, isAdmin, groupChatController.pinMessage);






// ==== One-on-One Chat Routes ====
// Create one-on-one chat (admin initiates one-on-one chat with another user)
router.post('/one-on-one/create', isAuthenticated, isAdmin, oneOnOneChatController.createOneOnOneChat);

// Get one-on-one chat details
router.get('/one-on-one/:chatId', isAuthenticated, oneOnOneChatController.getOneOnOneChat);

// Get messages for a one-on-one chat
router.get('/one-on-one/:chatId/messages', isAuthenticated, oneOnOneChatController.getOneOnOneMessages);

module.exports = router;
