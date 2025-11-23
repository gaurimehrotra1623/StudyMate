const express = require("express");
const router = express.Router();

const { getDashboard, createGoal, addFriend } = require("./dashboard_controller");
const { validate } = require("../../middleware/auth_middleware");

router.get('/', validate, getDashboard);
router.post('/goals', validate, createGoal);
router.post('/friends', validate, addFriend);

module.exports = router;