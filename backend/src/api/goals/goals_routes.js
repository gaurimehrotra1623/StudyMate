const express = require("express");
const router = express.Router();
const { getGoalById, createGoal, updateGoal, deleteGoal } = require("./goals_controllers");
const { validate } = require("../../middleware/auth_middleware");
router.get('/:id', validate, getGoalById);
router.post('/', validate, createGoal);
router.put('/:id', validate, updateGoal);
router.delete('/:id', validate, deleteGoal);
module.exports = router;
