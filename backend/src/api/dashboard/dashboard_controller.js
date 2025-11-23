const dashboardService = require("./dashboard_service");
module.exports = {
  getDashboard: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const data = await dashboardService.getDashboardData(userId);
      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
};
