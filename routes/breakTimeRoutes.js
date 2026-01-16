const express = require('express');
const router = express.Router();
const breakTimeController = require('../controllers/breakTimeController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All break time routes are protected with JWT authentication

// Individual break recording (Requires administrator role)
router.post('/tea-break-1', verifyToken, isAdmin, breakTimeController.recordTeaBreak1);
router.post('/tea-break-2', verifyToken, isAdmin, breakTimeController.recordTeaBreak2);
router.post('/lunch-break', verifyToken, isAdmin, breakTimeController.recordLunchBreak);

// Mark all breaks absent (Requires administrator role)
router.post('/mark-all-absent', verifyToken, isAdmin, breakTimeController.markAllBreaksAbsent);

// Retrieval routes
router.get('/all', verifyToken, breakTimeController.getAllBreaksByDateRange);
router.get('/employee', verifyToken, breakTimeController.getEmployeeBreaksByDateRange);
router.get('/daily-activity', verifyToken, breakTimeController.getDailyActivity);

module.exports = router;
