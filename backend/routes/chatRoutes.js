const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatControllers");
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get("/users", isAuthenticated, chatController.getAllUsers);
router.post("/message", isAuthenticated, chatController.sendMessage);
router.get("/history/:userId1/:userId2", isAuthenticated, chatController.getPrivateChat);
router.post("/group", isAuthenticated, chatController.createGroup);
router.get("/group/:groupId", isAuthenticated, chatController.getGroupDetails);
router.get("/group/:groupId/messages", isAuthenticated, chatController.getGroupMessages);
router.put("/group/:groupId", isAuthenticated, chatController.updateGroup);
router.get("/group/:groupId/media", isAuthenticated, chatController.getGroupMedia);
router.get("/mygroups/:userId", isAuthenticated, chatController.getGroupsForUser);

// New routes for user info and media gallery
router.get("/user-info/:userId", isAuthenticated, chatController.getUserInfo);
router.get("/chat-media/:userId1/:userId2", isAuthenticated, chatController.getChatMedia);

router.post('/mark-seen', chatController.markMessagesAsSeen);

router.get('/unread-counts/:userId', chatController.getUnreadCounts);
router.get('/group/:groupId/unread/:userId', chatController.getGroupUnreadCount);

module.exports = router;
