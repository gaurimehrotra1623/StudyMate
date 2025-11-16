const express = require('express')
const dotenv=require('dotenv')
const cors = require('cors')
const router = require('./api/auth/auth_routes.js')
const cookie = require('cookie-parser')
dotenv.config();
const port = process.env.PORT || 3000;
const app=express();

app.use(cors({
  origin: ['http://localhost:5173','https://study-mate-dvklf0xoj-gauris-projects-e00c6357.vercel.app', 'https://study-mate-phi-lac.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.options("*", cors());
app.use(cookie())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', port: port })
})

app.use('/api/auth', router)
app.listen(port, ()=>{
  console.log(`Congrats! Server started on port ${port}!`)
  console.log(`Server is accessible at http://localhost:${port}`)
})

