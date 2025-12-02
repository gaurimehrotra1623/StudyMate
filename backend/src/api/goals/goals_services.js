const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
module.exports = {
  getGoalById: async (goalId) => {
    return await prisma.goal.findUnique({
      where: { goal_id: Number(goalId) },
      include: {
        collaborators: {
          include: { user: true }
        },
        tasks: true
      }
    });
  },

  createGoal: async (goalData) => {
    const { title, due_date, ownerId, collaboratorUsernames } = goalData;
  
    return await prisma.goal.create({
      data: {
        title,
        due_date: new Date(due_date),
        owner: { connect: { user_id: ownerId } }
      }
    });
  },

  updateGoal: async (goalId, updateData) => {
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
