const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatControllers");
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get("/users", isAuthenticated, chatController.getAllUsers);
router.post("/message", isAuthenticated, chatController.sendMessage);
router.get("/history/:userId1/:userId2", isAuthenticated, chatController.getPrivateChat);
router.post("/group", isAuthenticated, chatController.createGroup);
router.get("/group/:groupId/messages", isAuthenticated, chatController.getGroupMessages);
router.get("/mygroups/:userId", isAuthenticated, chatController.getGroupsForUser);

module.exports = router;
