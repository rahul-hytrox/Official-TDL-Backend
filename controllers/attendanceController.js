const Attendance = require('../models/attendanceModel');

// HR: Add Employee Login Entry
exports.addLogin = async (req, res, next) => {
    try {
        const { emp_profile_id, login_date, login_time } = req.body;

        // Validation
        if (!emp_profile_id || !login_date || !login_time) {
            return res.status(400).json({
                success: false,
                message: 'emp_profile_id, login_date, and login_time are required'
            });
        }

        const result = await Attendance.addLogin(emp_profile_id, login_date, login_time);

        res.status(200).json({
            success: true,
            message: 'Employee login entry added successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// HR: Add Employee Logoff Entry
exports.addLogoff = async (req, res, next) => {
    try {
        const { emp_profile_id, logoff_date, logoff_time } = req.body;

        // Validation
        if (!emp_profile_id || !logoff_date || !logoff_time) {
            return res.status(400).json({
                success: false,
                message: 'emp_profile_id, logoff_date, and logoff_time are required'
            });
        }

        const result = await Attendance.addLogoff(emp_profile_id, logoff_date, logoff_time);

        res.status(200).json({
            success: true,
            message: 'Employee logoff entry added successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// HR: Mark Employee as Absent
exports.markAbsent = async (req, res, next) => {
    try {
        const { emp_profile_id, absent_date } = req.body;

        // Validation
        if (!emp_profile_id || !absent_date) {
            return res.status(400).json({
                success: false,
                message: 'emp_profile_id and absent_date are required'
            });
        }

        const result = await Attendance.markAbsent(emp_profile_id, absent_date);

        res.status(200).json({
            success: true,
            message: 'Employee marked as absent successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Get all employees attendance status by current date
exports.getTodayAttendance = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.getAllAttendanceByDate(today);

        res.status(200).json({
            success: true,
            date: today,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// Get all employees attendance by specific date
exports.getAttendanceByDate = async (req, res, next) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required (format: YYYY-MM-DD)'
            });
        }

        const attendance = await Attendance.getAllAttendanceByDate(date);

        res.status(200).json({
            success: true,
            date: date,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// Get attendance by emp_profile_id and date range
exports.getAttendanceByDateRange = async (req, res, next) => {
    try {
        const { emp_profile_id, start_date, end_date } = req.query;

        if (!emp_profile_id || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'emp_profile_id, start_date, and end_date are required'
            });
        }

        const attendance = await Attendance.getAttendanceByDateRange(emp_profile_id, start_date, end_date);

        res.status(200).json({
            success: true,
            emp_profile_id: emp_profile_id,
            start_date: start_date,
            end_date: end_date,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// Get all employees attendance by date range
exports.getAllAttendanceByDateRange = async (req, res, next) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'start_date and end_date are required'
            });
        }

        const attendance = await Attendance.getAllAttendanceByDateRange(start_date, end_date);

        // Group attendance by date
        const groupedAttendance = attendance.reduce((acc, curr) => {
            // Helper to format date as YYYY-MM-DD
            // Assuming emp_login_date is a Date object, we handle the conversion carefully
            // Using en-CA locale ensures YYYY-MM-DD format
            let dateKey;

            if (curr.emp_login_date instanceof Date) {
                dateKey = curr.emp_login_date.toLocaleDateString('en-CA');
            } else {
                // Fallback if it's already a string or other format, try to substring or use as is
                // If it's a full ISO string, split it. If it's just a date string, use it.
                dateKey = String(curr.emp_login_date).split('T')[0];
            }

            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(curr);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            start_date: start_date,
            end_date: end_date,
            count: attendance.length,
            data: groupedAttendance
        });
    } catch (error) {
        next(error);
    }
};

