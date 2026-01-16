const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All attendance routes are protected with JWT authentication

// HR Manual Attendance Entry routes (Requires administrator role)
router.post('/add-login', verifyToken, isAdmin, attendanceController.addLogin);
router.post('/add-logoff', verifyToken, isAdmin, attendanceController.addLogoff);
router.post('/mark-absent', verifyToken, isAdmin, attendanceController.markAbsent);

// Attendance Retrieval routes
router.get('/today', verifyToken, attendanceController.getTodayAttendance);
router.get('/by-date', verifyToken, attendanceController.getAttendanceByDate);
router.get('/date-range', verifyToken, attendanceController.getAttendanceByDateRange);
router.get('/all-date-range', verifyToken, attendanceController.getAllAttendanceByDateRange);

module.exports = router;
