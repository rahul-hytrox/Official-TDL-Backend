const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection, checkDBStatus, setDBStatus } = require('./config/database');
const dbChecker = require('./middleware/dbChecker');

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const breakTimeRoutes = require('./routes/breakTimeRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', async (req, res) => {
    res.json({
        success: true,
        message: 'ILEM Employee Attendance Management System API',
        version: '1.0.0',
        database: (await checkDBStatus()) ? 'Connected' : 'Disconnected'
    });
});

// Health check route
app.get('/health', async (req, res) => {
    const dbStatus = await testConnection();
    res.json({
        success: true,
        status: 'Server is running',
        database: dbStatus ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Use DB checker for all other API routes
app.use('/api', dbChecker);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/breaks', breakTimeRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/leave', leaveRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    // Handle database connection errors specifically
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message.includes('connect')) {
        console.error('❌ Database connectivity issue detected in request');
        setDBStatus(false);
        return res.status(503).json({
            success: false,
            message: 'Database connection failed. Please check if your MySQL server is running.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // General error logging (only if not a known DB error to reduce noise)
    console.error('Error:', err.stack);

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 API URL: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
