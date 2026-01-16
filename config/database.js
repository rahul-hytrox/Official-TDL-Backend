const mysql = require('mysql2');
require('dotenv').config();

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

// Get promise-based connection
const promisePool = pool.promise();

// Track database status
let isConnected = false;
let lastCheck = 0;
const CHECK_INTERVAL = 5000; // Check every 5 seconds if disconnected

// Test database connection
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        isConnected = true;
        lastCheck = Date.now();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        isConnected = false;
        lastCheck = Date.now();
        console.error('❌ Database connection failed');
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.message.includes('connect')) {
            console.error('   Reason: Could not connect to the database server.');
        } else {
            console.error('   Error:', error.message);
        }
        return false;
    }
};

// Function to check if database is connected
const checkDBStatus = async () => {
    // If connected, return true
    if (isConnected) return true;

    // If disconnected, only retry every CHECK_INTERVAL
    if (Date.now() - lastCheck > CHECK_INTERVAL) {
        return await testConnection();
    }

    return false;
};

// Function to manually set status (e.g. from error handler)
const setDBStatus = (status) => {
    isConnected = status;
    lastCheck = Date.now();
};

module.exports = {
    pool: promisePool,
    testConnection,
    checkDBStatus,
    setDBStatus
};
