const jwt = require('jsonwebtoken');
const Employee = require('../models/employeeModel');

// Generate JWT token based on API Key (Legacy/Internal)
exports.generateToken = (req, res, next) => {
    try {
        const { apiKey } = req.body;

        // Simple API key validation
        const validApiKey = process.env.API_KEY || 'EXPRO_ATTENDANCE_2025';

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'API key is required'
            });
        }

        if (apiKey !== validApiKey) {
            return res.status(401).json({
                success: false,
                message: 'Invalid API key'
            });
        }

        // Generate token with administrator role by default for API key (original behavior for internal tools)
        const token = jwt.sign(
            {
                apiKey: apiKey,
                emp_role: 'administrator', // API Key tokens are considered administrative
                timestamp: Date.now()
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || '24h'
            }
        );

        res.status(200).json({
            success: true,
            message: 'Token generated successfully',
            token: token,
            expiresIn: process.env.JWT_EXPIRE || '24h'
        });
    } catch (error) {
        next(error);
    }
};

// Employee Login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const employee = await Employee.login(email, password);

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                emp_id: employee.emp_id,
                emp_profile_id: employee.emp_profile_id,
                emp_email: employee.emp_email_id,
                emp_role: employee.emp_role,
                emp_name: `${employee.emp_first_name} ${employee.emp_last_name}`
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || '24h'
            }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            employee: {
                emp_profile_id: employee.emp_profile_id,
                emp_name: `${employee.emp_first_name} ${employee.emp_last_name}`,
                emp_email_id: employee.emp_email_id,
                emp_designation: employee.emp_designation,
                emp_role: employee.emp_role
            }
        });
    } catch (error) {
        next(error);
    }
};

// Verify token (for testing)
exports.verifyToken = (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: decoded
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};
