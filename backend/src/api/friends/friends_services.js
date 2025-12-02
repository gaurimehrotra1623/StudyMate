const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
module.exports ={
  getFriendshipData : async (userId) => {
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

    return {
      friends,
      friendSuggestions,
      friendsActivity
    };
  },
  
  addFriendship: async (userId, friendId) => {
    // Prevent self-friending
    if (userId === friendId) {
      throw new Error('Cannot add yourself as a friend');
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userA_id: userId, userB_id: friendId },
          { userA_id: friendId, userB_id: userId }
        ]
      }
    });

    if (existingFriendship) {
      throw new Error('Friendship already exists');
    }

    // Verify friend exists
    const friend = await prisma.users.findUnique({
      where: { user_id: friendId }
    });

    if (!friend) {
      throw new Error('User not found');
    }

    // Create friendship (always store with smaller ID as userA_id for consistency)
    const userA_id = userId < friendId ? userId : friendId;
    const userB_id = userId < friendId ? friendId : userId;

    const friendship = await prisma.friendship.create({
      data: {
        userA_id,
        userB_id
      }
    });

    return friendship;
  },
  
  getExistingFriends: async (userId) => {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userA_id: userId }, { userB_id: userId }]
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
      const friend = friendship.userA_id === userId ? friendship.userB : friendship.userA;
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
    // Get existing friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userA_id: userId }, { userB_id: userId }]
      }
    });

    const friendIds = friendships.flatMap(f =>
      f.userA_id === userId ? f.userB_id : f.userA_id
    );
    
    // Exclude current user and existing friends
    const excludedIds = Array.from(new Set([userId, ...friendIds]));

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
  }
  


}