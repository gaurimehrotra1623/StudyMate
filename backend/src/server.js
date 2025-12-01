const express = require('express')
const dotenv=require('dotenv')
const cors = require('cors')
const router = require('./api/auth/auth_routes.js')
const dashboardRoutes = require("./api/dashboard/dashboard_routes");
const cookie = require('cookie-parser')
dotenv.config();
const port = process.env.PORT || 3000;
const app=express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://study-mate-dvklf0xoj-gauris-projects-e00c6357.vercel.app',
      'https://study-mate-phi-lac.vercel.app',
      'https://study-mate-jt8nhm8yk-gauris-projects-e00c6357.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookie())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', port: port })
})

app.use('/api/auth', router)
app.use("/api/dashboard", dashboardRoutes);
app.listen(port, ()=>{
  console.log(`Congrats! Server started on port ${port}!`)
  console.log(`Server is accessible at http://localhost:${port}`)
})

