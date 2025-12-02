const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  getGoalsForUser: async (userId) => {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      console.error('Invalid userId in getGoalsForUser:', userId);
      return [];
    }
    
    try {
      const goals = await prisma.goal.findMany({
        where: { 
          owner_id: userIdNum
        },
        orderBy: { due_date: 'asc' }
      });
      
      const filteredGoals = goals.filter(goal => {
        const goalOwnerId = typeof goal.owner_id === 'number' ? goal.owner_id : parseInt(goal.owner_id, 10);
        const matches = goalOwnerId === userIdNum;
        if (!matches) {
          console.error(`Goal ${goal.goal_id} owner_id ${goalOwnerId} does not match userId ${userIdNum}`);
        }
        return matches;
      });
      
      return filteredGoals;
    } catch (error) {
      console.error('Error fetching goals for user:', error);
      return [];
    }
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
    const ownerIdNum = parseInt(ownerId, 10);

    return await prisma.goal.create({
      data: {
        title,
        due_date: new Date(due_date),
        owner: { connect: { user_id: ownerIdNum } }
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