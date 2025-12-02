const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
module.exports ={
  getFriendshipData : async (userId) => {
    const userIdNum = parseInt(userId, 10);
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

    return {
      friends,
      friendSuggestions,
      friendsActivity
    };
  },
  
  addFriendship: async (userId, friendId) => {
    const userIdNum = parseInt(userId, 10);
    const friendIdNum = parseInt(friendId, 10);
    
    // Prevent self-friending
    if (userIdNum === friendIdNum) {
      throw new Error('Cannot add yourself as a friend');
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userA_id: userIdNum, userB_id: friendIdNum },
          { userA_id: friendIdNum, userB_id: userIdNum }
        ]
      }
    });

    if (existingFriendship) {
      throw new Error('Friendship already exists');
    }

    // Verify friend exists
    const friend = await prisma.users.findUnique({
      where: { user_id: friendIdNum }
    });

    if (!friend) {
      throw new Error('User not found');
    }

    // Create friendship (always store with smaller ID as userA_id for consistency)
    const userA_id = userIdNum < friendIdNum ? userIdNum : friendIdNum;
    const userB_id = userIdNum < friendIdNum ? friendIdNum : userIdNum;

    const friendship = await prisma.friendship.create({
      data: {
        userA_id,
        userB_id
      }
    });

    return friendship;
  },
  
  getExistingFriends: async (userId) => {
    const userIdNum = parseInt(userId, 10);
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userA_id: userIdNum }, { userB_id: userIdNum }]
      },
      include: {
        userA: {
          select: {
            user_id: true,
            username: true,
            email: true
          }
        },
        userB: {
          select: {
            user_id: true,
            username: true,
            email: true
          }
        }
      }
    });

    // Transform to get friend details (the other user in each friendship)
    const friends = friendships.map(friendship => {
      const friend = friendship.userA_id === userIdNum ? friendship.userB : friendship.userA;
      return {
        id: friend.user_id,
        username: friend.username,
        email: friend.email,
        friendshipId: friendship.id
      };
    });

    return friends;
  },
  
  getAllUsersForSuggestions: async (userId) => {
    const userIdNum = parseInt(userId, 10);
    // Get existing friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userA_id: userIdNum }, { userB_id: userIdNum }]
      }
    });

    const friendIds = friendships.flatMap(f =>
      f.userA_id === userIdNum ? f.userB_id : f.userA_id
    );
    
    // Exclude current user and existing friends
    const excludedIds = Array.from(new Set([userIdNum, ...friendIds]));

    const allUsers = await prisma.users.findMany({
      where: {
        user_id: {
          notIn: excludedIds
        }
      },
      select: {
        user_id: true,
        username: true,
        email: true
      },
      orderBy: {
        username: 'asc'
      }
    });

    return allUsers;
  },

  removeFriendship: async (userId, friendId) => {
    const userIdNum = parseInt(userId, 10);
    const friendIdNum = parseInt(friendId, 10);
    
    // Find existing friendship (regardless of user order)
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userA_id: userIdNum, userB_id: friendIdNum },
          { userA_id: friendIdNum, userB_id: userIdNum }
        ]
      }
    });

    if (!friendship) {
      throw new Error('Friendship not found');
    }

    const deleted = await prisma.friendship.delete({
      where: { id: friendship.id }
    });

    return deleted;
  }
}