const BreakTime = require('../models/breakTimeModel');

// Record Tea Break 1
exports.recordTeaBreak1 = async (req, res, next) => {
    try {
        const { emp_profile_id, emp_login_date, start_time, end_time } = req.body;

        if (!emp_profile_id || !emp_login_date) {
            return res.status(400).json({ success: false, message: 'emp_profile_id and emp_login_date are required' });
        }

        // 1. Get attendance status from DB
        const loginStatus = await BreakTime.getAttendanceStatus(emp_profile_id, emp_login_date);

        // 2. Handle missing login status
        if (loginStatus === null) {
            return res.status(404).json({
                success: false,
                message: 'Employee login status not found, please check employee login or not'
            });
        }

        // 3. If Absent (0), mark all breaks as absent
        if (loginStatus === 0) {
            const result = await BreakTime.markAllBreaksAbsent(emp_profile_id, emp_login_date);
            return res.status(200).json({
                success: true,
                message: 'Employee is absent, all breaks marked as absent successfully',
                data: result
            });
        }

        // 4. If Present (1), record the break
        if (!start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'start_time and end_time are required for present employees'
            });
        }

        const result = await BreakTime.recordBreak({
            emp_profile_id,
            emp_login_date,
            emp_login_status: 1,
            breakType: 'tea1',
            startTime: start_time,
            endTime: end_time
        });

        res.status(200).json({
            success: true,
            message: 'Tea Break 1 recorded successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Record Tea Break 2
exports.recordTeaBreak2 = async (req, res, next) => {
    try {
        const { emp_profile_id, emp_login_date, start_time, end_time } = req.body;

        if (!emp_profile_id || !emp_login_date) {
            return res.status(400).json({ success: false, message: 'emp_profile_id and emp_login_date are required' });
        }

        const loginStatus = await BreakTime.getAttendanceStatus(emp_profile_id, emp_login_date);

        if (loginStatus === null) {
            return res.status(404).json({
                success: false,
                message: 'Employee login status not found, please check employee login or not'
            });
        }

        if (loginStatus === 0) {
            const result = await BreakTime.markAllBreaksAbsent(emp_profile_id, emp_login_date);
            return res.status(200).json({
                success: true,
                message: 'Employee is absent, all breaks marked as absent successfully',
                data: result
            });
        }

        if (!start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'start_time and end_time are required for present employees'
            });
        }

        const result = await BreakTime.recordBreak({
            emp_profile_id,
            emp_login_date,
            emp_login_status: 1,
            breakType: 'tea2',
            startTime: start_time,
            endTime: end_time
        });

        res.status(200).json({
            success: true,
            message: 'Tea Break 2 recorded successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Record Lunch Break
exports.recordLunchBreak = async (req, res, next) => {
    try {
        const { emp_profile_id, emp_login_date, start_time, end_time } = req.body;

        if (!emp_profile_id || !emp_login_date) {
            return res.status(400).json({ success: false, message: 'emp_profile_id and emp_login_date are required' });
        }

        const loginStatus = await BreakTime.getAttendanceStatus(emp_profile_id, emp_login_date);

        if (loginStatus === null) {
            return res.status(404).json({
                success: false,
                message: 'Employee login status not found, please check employee login or not'
            });
        }

        if (loginStatus === 0) {
            const result = await BreakTime.markAllBreaksAbsent(emp_profile_id, emp_login_date);
            return res.status(200).json({
                success: true,
                message: 'Employee is absent, all breaks marked as absent successfully',
                data: result
            });
        }

        if (!start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'start_time and end_time are required for present employees'
            });
        }

        const result = await BreakTime.recordBreak({
            emp_profile_id,
            emp_login_date,
            emp_login_status: 1,
            breakType: 'lunch',
            startTime: start_time,
            endTime: end_time
        });

        res.status(200).json({
            success: true,
            message: 'Lunch Break recorded successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// HR: Mark all breaks as absent (single request for tea1, tea2, lunch)
exports.markAllBreaksAbsent = async (req, res, next) => {
    try {
        const { emp_profile_id, absent_date } = req.body;

        // Validation
        if (!emp_profile_id || !absent_date) {
            return res.status(400).json({
                success: false,
                message: 'emp_profile_id and absent_date are required'
            });
        }

        const result = await BreakTime.markAllBreaksAbsent(emp_profile_id, absent_date);

        res.status(200).json({
            success: true,
            message: 'All breaks marked as absent successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Get all employees break records by date range
exports.getAllBreaksByDateRange = async (req, res, next) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'start_date and end_date are required (format: YYYY-MM-DD)'
            });
        }

        const breaks = await BreakTime.getAllBreaksByDateRange(start_date, end_date);

        res.status(200).json({
            success: true,
            start_date: start_date,
            end_date: end_date,
            count: breaks.length,
            data: breaks
        });
    } catch (error) {
        next(error);
    }
};

// Get specific employee break records by date range
exports.getEmployeeBreaksByDateRange = async (req, res, next) => {
    try {
        const { emp_profile_id, start_date, end_date } = req.query;

        if (!emp_profile_id || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'emp_profile_id, start_date, and end_date are required'
            });
        }

        const breaks = await BreakTime.getEmployeeBreaksByDateRange(emp_profile_id, start_date, end_date);

        res.status(200).json({
            success: true,
            emp_profile_id: emp_profile_id,
            start_date: start_date,
            end_date: end_date,
            count: breaks.length,
            data: breaks
        });
    } catch (error) {
        next(error);
    }
};

// Get specific employee daily activity (Attendance + Breaks)
exports.getDailyActivity = async (req, res, next) => {
    try {
        const { emp_profile_id, date } = req.query;

        if (!emp_profile_id || !date) {
            return res.status(400).json({
                success: false,
                message: 'emp_profile_id and date are required'
            });
        }

        const activity = await BreakTime.getDailyActivity(emp_profile_id, date);

        if (!activity) {
            return res.status(200).json({
                success: true,
                message: 'No activity found for this employee on the specified date',
                data: null
            });
        }

        // Calculate total break time in minutes
        const calculateMinutes = (start, end) => {
            if (!start || !end || start === '00:00:00' || end === '00:00:00') return 0;
            const [sH, sM, sS] = start.split(':').map(Number);
            const [eH, eM, eS] = end.split(':').map(Number);
            return (eH * 60 + eM) - (sH * 60 + sM);
        };

        const formatTimeAMPM = (timeStr) => {
            if (!timeStr || timeStr === '00:00:00') return null;
            const [h, m] = timeStr.split(':');
            let hours = parseInt(h);
            const minutes = m;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
        };

        const tea1Min = calculateMinutes(activity.emp_tea_break_1_start_time, activity.emp_tea_break_1_end_time);
        const lunchMin = calculateMinutes(activity.emp_lunch_break_start_time, activity.emp_lunch_break_end_time);
        const tea2Min = calculateMinutes(activity.emp_tea_break_2_start_time, activity.emp_tea_break_2_end_time);
        const totalMin = tea1Min + lunchMin + tea2Min;

        const customizedData = {
            emp_id: emp_profile_id,
            date: activity.emp_login_date,
            attendance: {
                status: activity.attendance_status === 1 ? 'Present' : 'Absent',
                login_time: formatTimeAMPM(activity.emp_login_time),
                logoff_time: formatTimeAMPM(activity.emp_logoff_time),
                raw_login: activity.emp_login_time,
                raw_logoff: activity.emp_logoff_time
            },
            breaks: {
                tea_break_1: {
                    start: formatTimeAMPM(activity.emp_tea_break_1_start_time),
                    end: formatTimeAMPM(activity.emp_tea_break_1_end_time),
                    raw_start: activity.emp_tea_break_1_start_time,
                    raw_end: activity.emp_tea_break_1_end_time,
                    duration: `${tea1Min} min's`
                },
                lunch_break: {
                    start: formatTimeAMPM(activity.emp_lunch_break_start_time),
                    end: formatTimeAMPM(activity.emp_lunch_break_end_time),
                    raw_start: activity.emp_lunch_break_start_time,
                    raw_end: activity.emp_lunch_break_end_time,
                    duration: `${lunchMin} min's`
                },
                tea_break_2: {
                    start: formatTimeAMPM(activity.emp_tea_break_2_start_time),
                    end: formatTimeAMPM(activity.emp_tea_break_2_end_time),
                    raw_start: activity.emp_tea_break_2_start_time,
                    raw_end: activity.emp_tea_break_2_end_time,
                    duration: `${tea2Min} min's`
                }
            },
            summary: {
                total_break_mins: totalMin,
                total_break_hrs: (totalMin / 60).toFixed(2)
            }
        };

        res.status(200).json({
            success: true,
            data: customizedData
        });
    } catch (error) {
        next(error);
    }
};
