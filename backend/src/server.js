const express = require('express')
const dotenv=require('dotenv')
const cors = require('cors')
const router = require('./api/auth/auth_routes.js')
const cookie = require('cookie-parser')
dotenv.config();
const port = process.env.PORT;
const app=express();
app.use(cookie())

app.use(express.json())

app.use('app/auth', router)
app.listen(port, ()=>{
  console.log(`Congrats! Server started on port ${port}!`)
})

