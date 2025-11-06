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
    const token = JWT.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'})
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    })
    res.json({message: 'Login successful'})
  }
  catch(err){
    console.error('Login error:', err)
    return res.status(500).json(`Server Error: ${err.message}`)
  }
}


const logout = async(req,res)=>{
  const token = req.cookies.token
  if(!token){
    return res.status(400).json('No token found!')
  }
  res.clearCookie('token',{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  })
  res.json({message: 'Logout successful'})
}

module.exports = {signup, login, logout}
