const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const deleteAccount = async (req, res) => {
  try {
    const userId = parseInt(req.user.id || req.user.user_id, 10)
    
    if (!userId || isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID'
      })
    }

    await prisma.$transaction(async (tx) => {
      await tx.goal_collaborators.deleteMany({
        where: { user_id: userId }
      })

      await tx.goals.deleteMany({
        where: { owner_id: userId }
      })

      await tx.friendships.deleteMany({
        where: {
          OR: [
            { user_id: userId },
            { friend_id: userId }
          ]
        }
      })

      await tx.refresh_token.deleteMany({
        where: { user_id: userId }
      })

      await tx.users.delete({
        where: { user_id: userId }
      })
    })

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    })
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    })

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete account'
    })
  }
}

module.exports = { deleteAccount }
