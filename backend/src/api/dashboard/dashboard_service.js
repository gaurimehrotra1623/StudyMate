const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
module.exports = {
  getDashboardData: async (userId) => {
    const ongoingGoals = await prisma.goal.findMany({
      where: {
        OR: [
          { owner_id: userId },
          { collaborators: { some: { user_id: userId } } }
        ]
      },
      include: {
        collaborators: {
          include: { user: true }
        }
      }
    });
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [{ userA_id: userId }, { userB_id: userId }]
      }
    });

    const friendIds = friends.flatMap(f =>
      f.userA_id === userId ? f.userB_id : f.userA_id
    );
    const friendSuggestions = await prisma.users.findMany({
      where: {
        user_id: { not: userId },
        user_id: { notIn: friendIds }
      },
      take: 6
    });
    const friendsActivity = await prisma.activity.findMany({
      where: {
        user_id: { in: friendIds }
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: true
      }
    });

    return {
      ongoingGoals,
      friendSuggestions,
      friendsActivity
    };
  },
};
