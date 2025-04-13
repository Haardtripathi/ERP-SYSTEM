const GroupChat = require("../../models/GroupChat");

// Create a new group (Admin only)
exports.createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const adminId = req.user._id; // from isAuthenticated & isAdmin middleware

        // Auto-add the admin and use Set to avoid duplicates
        const participants = Array.from(new Set([...members, adminId]));

        const newGroup = await GroupChat.create({
            name,
            participants,
            // If you choose to store admin separately, set it here.
            admin: adminId, // or use createdBy field if you prefer
            createdAt: new Date()
        });

        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Failed to create group" });
    }
};

// Add a member to a group (Admin only)
exports.addMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const { groupId } = req.params;
        const updatedGroup = await GroupChat.findByIdAndUpdate(
            groupId,
            { $addToSet: { participants: userId } },
            { new: true }
        );
        res.json(updatedGroup);
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ error: "Failed to add member" });
    }
};

// Remove a member from a group (Admin only)
exports.removeMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const { groupId } = req.params;
        const updatedGroup = await GroupChat.findByIdAndUpdate(
            groupId,
            { $pull: { participants: userId } },
            { new: true }
        );
        res.json(updatedGroup);
    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ error: "Failed to remove member" });
    }
};

// Get group details (Authenticated users)
// Hides the admin from non-admin responses.
exports.getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        let group = await GroupChat.findById(groupId).populate("participants", "-password");

        // Filter out admin from participants for non-admin users
        if (req.user.role !== "Admin") {
            group = group.toObject();
            group.participants = group.participants.filter(
                (user) => user._id.toString() !== process.env.ADMIN_ID
            );
        }

        res.json(group);
    } catch (error) {
        console.error("Error fetching group details:", error);
        res.status(500).json({ error: "Failed to fetch group details" });
    }
};

// Leave group (Any member can leave)
exports.leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        const updatedGroup = await GroupChat.findByIdAndUpdate(
            groupId,
            { $pull: { participants: userId } },
            { new: true }
        );
        res.json(updatedGroup);
    } catch (error) {
        console.error("Error leaving group:", error);
        res.status(500).json({ error: "Failed to leave group" });
    }
};

// Pin a group message (Admin only)
exports.pinMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { messageId } = req.body;
        const updatedGroup = await GroupChat.findByIdAndUpdate(
            groupId,
            { pinnedMessage: messageId },
            { new: true }
        ).populate("pinnedMessage");

        res.json(updatedGroup.pinnedMessage);
    } catch (error) {
        console.error("Error pinning message:", error);
        res.status(500).json({ error: "Failed to pin message" });
    }
};
