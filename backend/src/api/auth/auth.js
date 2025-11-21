const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()


const signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json('All fields are required!');
  }
  if (!email.includes('@')) {
    return res.status(400).json('Invalid email!');
  }
  if (password.length < 8) {
    return res.status(400).json('Password should be at least 8 characters!');
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: {
        username,
        email,
        password_hash: hashedPassword
      }
    });
    return res.status(201).json('User created successfully');
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json('User with this email already exists!');
    }
    return res.status(500).json(`Server Error: ${err.message}`);
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('All fields are required!');
  }
  try {
    const exists = await prisma.users.findUnique({
      where: { email }
    });
    if (!exists) {
      return res.status(400).json('Invalid email or password!');
    }
    const isMatch = await bcrypt.compare(password, exists.password_hash);
    if (!isMatch) {
      return res.status(400).json('Invalid email or password!');
    }
    const payload = {
      user: {
        id: exists.user_id,
        username: exists.username,
        email: exists.email
      }
    };
    const accessToken = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = JWT.sign(
      { userId: exists.user_id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    await prisma.refresh_token.create({
      data: {
        user_id: exists.user_id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken
    });
  } catch (err) {
    return res.status(500).json(`Server Error: ${err.message}`);
  }
};



const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json('No refresh token found!');
  }
  try {
    const decoded = JWT.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    const check_token = await prisma.refresh_token.findUnique({
      where: { token: refreshToken }
    });
    if (!check_token) {
      return res.status(401).json('Invalid or expired refresh token!');
    }
    if (check_token.expires_at < new Date()) {
      return res.status(401).json('Invalid or expired refresh token!');
    }
    const user = await prisma.users.findUnique({
      where: { user_id: decoded.userId }
    });
    if (!user) {
      return res.status(401).json('User not found!');
    }
    const payload = {
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email
      }
    };
    const newAccessToken = JWT.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });
    return res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      res.clearCookie('refreshToken');
      return res.status(401).json('Invalid or expired refresh token!');
    }
    return res.status(500).json(`Server Error: ${err.message}`);
  }
};


const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  if (refreshToken) {
    try {
      await prisma.refresh_token.delete({
        where: { token: refreshToken }
      });
    } catch (err) {
      if (err.code !== 'P2025') {
        console.error('Error deleting refresh token:', err);
      }
    }
  }
  return res.json({ message: 'Logout successful' });
};



module.exports = {signup, login, logout, refresh}
