const pool = require('../../config/db.js')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')

const signup = async(req,res)=>{
  const {username, email, password} = req.body 
  if(!username || !email || !password){
    return res.status(400).json('All fields are require!')
  }
  if(!email.trim().includes('@')){
    return res.status(400).json('Invalid email!')
  }
  if(password.trim().length < 8){
    return res.status(400).json('Password should be atleast 8 characters long!')
  }
  try{
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const sql = 'INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)';
    const [result] = await pool.execute(sql, [username, email, hashedPassword]);
    console.log('user created successfully')
    return res.status(201).json('User created successfully')
  }
  catch(err){
    console.error('Signup error:', err)
    if(err.code === 'ER_DUP_ENTRY'){
      return res.status(400).json('User with this email already exists!')
    }
    return res.status(500).json(`Server Error: ${err.message}`)
  }
}

const login = async(req,res)=>{
  const {email, password} = req.body
  if(!email || !password){
    return res.status(400).json('All fields are require!')
  }
  try{
    const sql = 'SELECT * FROM Users WHERE email = ?'
    const [rows] = await pool.execute(sql, [email])
    if(rows.length === 0){
      return res.status(400).json('Invalid email or password!')
    }
    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if(!isMatch){
      return res.status(400).json('Invalid email or password!')
    }
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }
    const accessToken = JWT.sign(payload, process.env.JWT_SECRET, {expiresIn: '15m'})
    const refreshToken = JWT.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const refreshTokenSql = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))'
    await pool.execute(refreshTokenSql, [user.id, refreshToken])
    
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 
    })
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    })
    
    res.json({message: 'Login successful'})
  }
  catch(err){
    console.error('Login error:', err)
    return res.status(500).json(`Server Error: ${err.message}`)
  }
}


const refresh = async(req,res)=>{
  const refreshToken = req.cookies.refreshToken
  if(!refreshToken){
    return res.status(401).json('No refresh token found!')
  }
  
  try{
    const decoded = JWT.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    )
    
    const checkTokenSql = 'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()'
    const [tokenRows] = await pool.execute(checkTokenSql, [refreshToken, decoded.userId])
    
    if(tokenRows.length === 0){
      return res.status(401).json('Invalid or expired refresh token!')
    }
    
    const userSql = 'SELECT * FROM Users WHERE id = ?'
    const [userRows] = await pool.execute(userSql, [decoded.userId])
    
    if(userRows.length === 0){
      return res.status(401).json('User not found!')
    }
    
    const user = userRows[0]
    
    const payload = {
      user: {
        id: user.id,
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
    
    res.json({message: 'Token refreshed successfully'})
  }
  catch(err){
    console.error('Refresh token error:', err)
    if(err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError'){
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      return res.status(401).json('Invalid or expired refresh token!')
    }
    return res.status(500).json(`Server Error: ${err.message}`)
  }
}

const logout = async(req,res)=>{
  const refreshToken = req.cookies.refreshToken
  
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
  
  if(refreshToken){
    try{
      const deleteTokenSql = 'DELETE FROM refresh_tokens WHERE token = ?'
      await pool.execute(deleteTokenSql, [refreshToken])
    }
    catch(err){
      console.error('Error deleting refresh token:', err)
    }
  }
  
  res.json({message: 'Logout successful'})
}

module.exports = {signup, login, logout, refresh}