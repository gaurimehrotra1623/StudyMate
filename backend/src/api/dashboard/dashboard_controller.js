const dashboardService = require("./dashboard_service");
module.exports = {
  getDashboard: async (req, res) => {
    try {
      const userId = req.user.id || req.user.user_id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "User not authenticated" 
        });
      }
      const data = await dashboardService.getDashboardData(userId);
      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      return res.status(500).json({ 
        success: false, 
        message: err.message || "Server error" 
      });
    }
  },
  createGoal: async (req, res) => {
    try {
      const userId = req.user.id || req.user.user_id;
      const { title, due_date, collaborators } = req.body;
      
      if (!title || !due_date) {
        return res.status(400).json({ 
          success: false, 
          message: "Title and due date are required" 
        });
      }

      const goal = await dashboardService.createGoal(userId, {
        title,
        due_date,
        collaboratorUsernames: collaborators
      });

      return res.status(201).json({
        success: true,
        data: goal
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ 
        success: false, 
        message: err.message || "Server error" 
      });
    }
  },
  addFriend: async (req, res) => {
    try {
      const userId = req.user.id || req.user.user_id;
      const { friendId } = req.body;
      
      if (!friendId) {
        return res.status(400).json({ 
          success: false, 
          message: "Friend ID is required" 
        });
      }

      const friendship = await dashboardService.addFriend(userId, parseInt(friendId));

      return res.status(201).json({
        success: true,
        message: 'Friend added successfully',
        data: friendship
      });
    } catch (err) {
      console.error('Add friend error:', err);
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
        message: err.message || "Server error" 
      });
    }
  }
};
