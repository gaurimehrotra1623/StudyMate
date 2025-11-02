const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    ssl: {
        ca: fs.readFileSync(process.env.DB_SSL_PATH)
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the Aiven database pool.');
    connection.release();
  })
  .catch(err => {
    console.error(' Error connecting to the database pool:');
    console.error(err.message);
  });

module.exports = pool;