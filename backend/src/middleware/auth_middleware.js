const JWT = require('jsonwebtoken')
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

const validate = async(req,res,next)=>{
  const token = req.cookies.token
  const refreshToken = req.cookies.refreshToken
  
  
  if(!token && refreshToken){
    try{
      const decoded = JWT.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      )
      const tokenRow = await prisma.refresh_token.findFirst({
        where: {
          token: refreshToken,
          user_id: decoded.userId,
          expires_at: {
            gt: new Date()
          }
        }
      })
      if(tokenRow){
        const user = await prisma.users.findUnique({
          where: { user_id: decoded.userId }
        })
        
        if(user){
          const payload = {
            user: {
              id: user.user_id,
              username: user.username,
              email: user.email
            }
          }
          const newAccessToken = JWT.sign(payload, process.env.JWT_SECRET, {expiresIn: '15m'})
          
          res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
          })
          
          req.user = payload.user
          return next()
        }
      }
    }
    catch(err){
    }
  }
  if(!token){
    return res.status(401).json('No token found, authorization denied')
  }
  
  try{
    const decoded = JWT.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    next()
  }
  catch(err){
    if(err.name === 'TokenExpiredError' && refreshToken){
      try{
        const decoded = JWT.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        )
        
        const tokenRow = await prisma.refresh_token.findFirst({
          where: {
            token: refreshToken,
            user_id: decoded.userId,
            expires_at: {
              gt: new Date()
            }
          }
        })
        
        if(tokenRow){
          const user = await prisma.users.findUnique({
            where: { user_id: decoded.userId }
          })
          
          if(user){
            const payload = {
              user: {
                id: user.user_id,
                username: user.username,
                email: user.email
              }
            }
            const newAccessToken = JWT.sign(payload, process.env.JWT_SECRET, {expiresIn: '15m'})
            res.cookie('token', newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 15 * 60 * 1000
            })
            
            req.user = payload.user
            return next()
          }
        }
      }
      catch(refreshErr){
        return res.status(401).json('Token expired and refresh failed')
      }
    }
    return res.status(401).json('Token is not valid')
  }
}

module.exports = { validate }