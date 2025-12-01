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
    const excludedIds = Array.from(new Set([userId, ...friendIds]))

    const friendSuggestions = await prisma.users.findMany({
      where: {
        user_id: {
          notIn: excludedIds
        }
      },
      orderBy: {
        username: 'asc'
      }
    });
    const friendsActivity = friendIds.length > 0 
      ? await prisma.activity.findMany({
          where: {
            user_id: { in: friendIds }
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: true
          }
        })
      : [];

    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        email: true
      }
    });

    return {
      user,
      ongoingGoals,
      friendSuggestions,
      friendsActivity
    };
  },
  createGoal: async (userId, goalData) => {
    const { title, due_date, collaboratorUsernames } = goalData
  
    const goal = await prisma.goal.create({
      data: {
        title,
        due_date: new Date(due_date),
        progress: 0,
        owner_id: userId
      }
    })
    if (collaboratorUsernames && collaboratorUsernames.length > 0) {
      const collaboratorNames = collaboratorUsernames.split(',').map(name => name.trim()).filter(name => name)
      
      for (const username of collaboratorNames) {
        const collaborator = await prisma.users.findUnique({
          where: { username }
        })
        
        if (collaborator) {
          await prisma.userGoalCollaborator.create({
            data: {
              user_id: collaborator.user_id,
              goal_id: goal.goal_id
            }
          })
        }
      }
    }

    await prisma.activity.create({
      data: {
        user_id: userId,
        type: 'created_goal',
        message: `Created goal: ${title}`
      }
    })

    return goal
  },
  addFriend: async (userId, friendId) => {
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userA_id: userId, userB_id: friendId },
          { userA_id: friendId, userB_id: userId }
        ]
      }
    })

    if (existingFriendship) {
      throw new Error('Friendship already exists')
    }
    const friendship = await prisma.friendship.create({
      data: {
        userA_id: userId,
        userB_id: friendId
      }
    })
    const friend = await prisma.users.findUnique({
      where: { user_id: friendId }
    })

    await prisma.activity.create({
      data: {
        user_id: userId,
        type: 'added_friend',
        message: `Added ${friend?.username || 'friend'} as a friend`
      }
    })

    return friendship
  },
};
