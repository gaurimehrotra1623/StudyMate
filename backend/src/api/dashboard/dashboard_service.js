const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
module.exports = {
  getDashboardData: async (userId) => {
    const userIdNum = parseInt(userId, 10);
    const ongoingGoals = await prisma.goal.findMany({
      where: {
        owner_id: userIdNum
      },
    });
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [{ userA_id: userIdNum }, { userB_id: userIdNum }]
      }
    });

    const friendIds = friends.flatMap(f =>
      f.userA_id === userIdNum ? f.userB_id : f.userA_id
    );
    const excludedIds = Array.from(new Set([userIdNum, ...friendIds]))

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
      where: { user_id: userIdNum },
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
    const userIdNum = parseInt(userId, 10);
    const { title, due_date } = goalData
  
    const goal = await prisma.goal.create({
      data: {
        title,
        due_date: new Date(due_date),
        progress: 0,
        owner_id: userIdNum
      }
    })

    await prisma.activity.create({
      data: {
        user_id: userIdNum,
        type: 'created_goal',
        message: `Created goal: ${title}`
      }
    })

    return goal
  },
  addFriend: async (userId, friendId) => {
    const userIdNum = parseInt(userId, 10);
    const friendIdNum = parseInt(friendId, 10);
    
    // Prevent self-friending
    if (userIdNum === friendIdNum) {
      throw new Error('Cannot add yourself as a friend')
    }

    // Verify friend exists
    const friend = await prisma.users.findUnique({
      where: { user_id: friendIdNum }
    })

    if (!friend) {
      throw new Error('User not found')
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userA_id: userIdNum, userB_id: friendIdNum },
          { userA_id: friendIdNum, userB_id: userIdNum }
        ]
      }
    })

    if (existingFriendship) {
      throw new Error('Friendship already exists')
    }

    // Create friendship (always store with smaller ID as userA_id for consistency)
    const userA_id = userIdNum < friendIdNum ? userIdNum : friendIdNum
    const userB_id = userIdNum < friendIdNum ? friendIdNum : userIdNum

    const friendship = await prisma.friendship.create({
      data: {
        userA_id,
        userB_id
      }
    })

    // Create activity
    await prisma.activity.create({
      data: {
        user_id: userIdNum,
        type: 'added_friend',
        message: `Added ${friend.username} as a friend`
      }
    })

    return friendship
  },
};
