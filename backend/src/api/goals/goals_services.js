const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  getGoalsForUser: async (userId) => {
    return await prisma.goal.findMany({
      where: { owner_id: Number(userId) },
      orderBy: { due_date: 'asc' }
    });
  },
  getGoalById: async (goalId) => {
    return await prisma.goal.findUnique({
      where: { goal_id: Number(goalId) },
      include: {
        owner: true   
      }
    });
  },

  createGoal: async (goalData) => {
    const { title, due_date, ownerId } = goalData;

    return await prisma.goal.create({
      data: {
        title,
        due_date: new Date(due_date),
        owner: { connect: { user_id: ownerId } }
      }
    });
  },

  updateGoal: async (goalId, updateData) => {
    if (updateData.due_date) {
      updateData.due_date = new Date(updateData.due_date);
    }
    return await prisma.goal.update({
      where: { goal_id: Number(goalId) },
      data: updateData
    });
  },

  deleteGoal: async (goalId) => {
    return await prisma.goal.delete({
      where: { goal_id: Number(goalId) }
    });
  }
};