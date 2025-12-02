const friendshipService = require('./friends_services.js');
module.exports = {
  getFriendship: async (req, res) => {
    try {
      const userId = parseInt(req.user.id || req.user.user_id, 10);
      const data = await friendshipService.getFriendshipData(userId);
      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
  
  addFriend: async (req, res) => {
    try {
      const userId = parseInt(req.user.id || req.user.user_id, 10);
      const { friendId } = req.body;

      if (!friendId) {
        return res.status(400).json({
          success: false,
          message: 'Friend ID is required'
        });
      }

      const friendship = await friendshipService.addFriendship(userId, parseInt(friendId));
      
      return res.status(201).json({
        success: true,
        message: 'Friend added successfully',
        data: friendship
      });
    } catch (err) {
      console.error(err);
      if (err.message === 'Cannot add yourself as a friend' || 
          err.message === 'Friendship already exists' ||
          err.message === 'User not found') {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },
  
  getExistingFriends: async (req, res) => {
    try {
      const userId = parseInt(req.user.id || req.user.user_id, 10);
      const friends = await friendshipService.getExistingFriends(userId);
      return res.status(200).json({
        success: true,
        data: friends
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
  
  getAllUsersForSuggestions: async (req, res) => {
    try {
      const userId = parseInt(req.user.id || req.user.user_id, 10);
      const users = await friendshipService.getAllUsersForSuggestions(userId);
      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },

  removeFriend: async (req, res) => {
    try {
      const userId = parseInt(req.user.id || req.user.user_id, 10);
      const { friendId } = req.body;

      if (!friendId) {
        return res.status(400).json({
          success: false,
          message: 'Friend ID is required'
        });
      }

      await friendshipService.removeFriendship(userId, parseInt(friendId));

      return res.status(200).json({
        success: true,
        message: 'Friend removed successfully'
      });
    } catch (err) {
      console.error(err);
      if (err.message === 'Friendship not found') {
        return res.status(404).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}