const goalsService = require('./goals_services');
module.exports = {
  getGoals: async (req, res) => {
    try {
      const userId = req.user.id || req.user.user_id;
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
        const goalId = parseInt(req.params.id, 10);
        const goal = await goalsService.getGoalById(goalId);
        if (!goal) {
          return res.status(404).json({
            success: false,
            message: "Goal not found"
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
      const userId = req.user.id || req.user.user_id;
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
      const goalId = parseInt(req.params.id, 10);
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
      const goalId = parseInt(req.params.id, 10);

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