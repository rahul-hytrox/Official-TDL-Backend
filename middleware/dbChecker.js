const { checkDBStatus } = require('../config/database');

/**
 * Middleware to check database connection status
 * If database is not connected, returns a 503 Service Unavailable response
 */
const dbChecker = async (req, res, next) => {
    if (!(await checkDBStatus())) {
        return res.status(503).json({
            success: false,
            message: 'Database connection is temporarily unavailable. Please try again later.',
            status: 'database_disconnected'
        });
    }
    next();
};

module.exports = dbChecker;
