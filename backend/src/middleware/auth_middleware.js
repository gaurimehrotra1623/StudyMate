const JWT = require('jsonwebtoken')
const pool = require('../config/db.js')

const validate = async(req,res,next)=>{
  const token = req.cookies.token
  const refreshToken = req.cookies.refreshToken
  if(!token && refreshToken){
    try{
      const decoded = JWT.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      )
      const checkTokenSql = 'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()'
      const [tokenRows] = await pool.execute(checkTokenSql, [refreshToken, decoded.userId])
      
      if(tokenRows.length > 0){
        const userSql = 'SELECT * FROM Users WHERE id = ?'
        const [userRows] = await pool.execute(userSql, [decoded.userId])
        
        if(userRows.length > 0){
          const user = userRows[0]
          const payload = {
            user: {
              id: user.user_id,
              username: user.username,
              email: user.email
            }
          }
          const newAccessToken = JWT.sign(payload, process.env.JWT_SECRET, {expiresIn: '15m'})
          console.log('JWT Token' , newAccessToken)
          
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
        
        const checkTokenSql = 'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()'
        const [tokenRows] = await pool.execute(checkTokenSql, [refreshToken, decoded.userId])
        
        if(tokenRows.length > 0){
          const userSql = 'SELECT * FROM Users WHERE id = ?'
          const [userRows] = await pool.execute(userSql, [decoded.userId])
          
          if(userRows.length > 0){
            const user = userRows[0]
            const payload = {
              user: {
                id: user.user_id,
                username: user.username,
                email: user.email
              }
            }
            const newAccessToken = JWT.sign(payload, process.env.JWT_SECRET, {expiresIn: '15m'})
            console.log('JWT Token' , newAccessToken)
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