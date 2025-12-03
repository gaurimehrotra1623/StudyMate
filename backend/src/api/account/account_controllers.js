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

    console.log('Deleting account for user:', userId)

    try {
      await prisma.activity.deleteMany({
        where: { user_id: userId }
      })
      console.log('Deleted activities')
    } catch (err) {
      console.log('Error deleting activities:', err.message)
    }

    try {
      await prisma.goal.deleteMany({
        where: { owner_id: userId }
      })
      console.log('Deleted goals')
    } catch (err) {
      console.log('Error deleting goals:', err.message)
    }

    try {
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { userA_id: userId },
            { userB_id: userId }
          ]
        }
      })
      console.log('Deleted friendships')
    } catch (err) {
      console.log('Error deleting friendships:', err.message)
    }

    try {
      await prisma.refresh_token.deleteMany({
        where: { user_id: userId }
      })
      console.log('Deleted refresh tokens')
    } catch (err) {
      console.log('Error deleting refresh tokens:', err.message)
    }

    await prisma.users.delete({
      where: { user_id: userId }
    })
    console.log('Deleted user')

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
    console.error('Error stack:', error.stack)
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete account'
    })
  }
}

module.exports = { deleteAccount }
