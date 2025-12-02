const goalsService = require('./goals_services');
module.exports = {
  getGoals: async (req, res) => {
    try {
      const userId = parseInt(req.user.id || req.user.user_id, 10);
      if (!userId || isNaN(userId)) {
        return res.status(401).json({
          success: false,
          message: "Invalid user ID"
        });
      }
      const goals = await goalsService.getGoalsForUser(userId);
      return res.status(200).json({
        success: true,
        data: goals
      });
    } catch (err) {
      console.error('Get Goals error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || "Server error"
      });
    }
  },
  getGoalById :
    async (req, res)=>{
      try {
        const userId = parseInt(req.user.id || req.user.user_id, 10);
        const goalId = parseInt(req.params.id, 10);
        const goal = await goalsService.getGoalById(goalId);
        if (!goal) {
          return res.status(404).json({
            success: false,
            message: "Goal not found"
          });
        }
        if (goal.owner_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "Access denied. This goal does not belong to you."
          });
        }
        return res.status(200).json({
          success: true,
          data: goal
        });
      } catch (err) {
        console.error('Get Goal error:', err);
        return res.status(500).json({
          success: false,
          message: err.message || "Server error"
        });
      }
  },
  createGoal : async(req,res)=>{
    try {
      const userId = parseInt(req.user.id || req.user.user_id, 10);
      const { title, due_date, collaborators } = req.body;

      if (!title || !due_date) {
        return res.status(400).json({
          success: false,
          message: "Title and due date are required"
        });
      }

      const goal = await goalsService.createGoal({
        title,
        due_date,
        ownerId: userId,
        collaboratorUsernames: collaborators
      });

      return res.status(201).json({
        success: true,
        data: goal
      });
    } catch (err) {
      console.error('Create Goal error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || "Server error"
      });
    }
  },
  updateGoal : async(req,res)=>{
    try {
      const userId = parseInt(req.user.id || req.user.user_id, 10);
      const goalId = parseInt(req.params.id, 10);
      
      const existingGoal = await goalsService.getGoalById(goalId);
      if (!existingGoal) {
        return res.status(404).json({
          success: false,
          message: "Goal not found"
        });
      }
      if (existingGoal.owner_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only update your own goals."
        });
      }

      const updateData = req.body;
      const updatedGoal = await goalsService.updateGoal(goalId, updateData);

      return res.status(200).json({
        success: true,
        data: updatedGoal
      });
    } catch (err) {
      console.error('Update Goal error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || "Server error"
      });
    }
  },
  deleteGoal : async(req,res)=>{
    try {
      const userId = parseInt(req.user.id || req.user.user_id, 10);
      const goalId = parseInt(req.params.id, 10);

      const existingGoal = await goalsService.getGoalById(goalId);
      if (!existingGoal) {
        return res.status(404).json({
          success: false,
          message: "Goal not found"
        });
      }
      if (existingGoal.owner_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only delete your own goals."
        });
      }

      await goalsService.deleteGoal(goalId);

      return res.status(200).json({
        success: true,
        message: "Goal deleted successfully"
      });
    } catch (err) {
      console.error('Delete Goal error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || "Server error"
      });
    }
  }
  
}