const { pool } = require('../config/database');

class Attendance {
    // HR: Add Employee Login Entry
    static async addLogin(emp_profile_id, login_date, login_time) {
        try {
            // Check if attendance record exists for this date
            const [existing] = await pool.query(
                'SELECT emp_profile_id,emp_login_date,emp_login_time,emp_logoff_time,emp_login_status FROM emp_attendance WHERE emp_profile_id = ? AND emp_login_date = ?',
                [emp_profile_id, login_date]
            );

            if (existing.length > 0) {
                // Update existing record
                const [result] = await pool.query(
                    'UPDATE emp_attendance SET emp_login_time = ?, emp_login_status = 1 WHERE emp_profile_id = ? AND emp_login_date = ?',
                    [login_time, emp_profile_id, login_date]
                );
                return result;
            } else {
                // Create new record
                const [result] = await pool.query(
                    'INSERT INTO emp_attendance (emp_profile_id, emp_login_date, emp_login_time, emp_login_status) VALUES (?, ?, ?, 1)',
                    [emp_profile_id, login_date, login_time]
                );
                return result;
            }
        } catch (error) {
            throw error;
        }
    }

    // HR: Add Employee Logoff Entry
    static async addLogoff(emp_profile_id, logoff_date, logoff_time) {
        try {
            // Check if attendance record exists for this date
            const [existing] = await pool.query(
                'SELECT emp_profile_id,emp_login_date,emp_login_time,emp_logoff_time,emp_login_status FROM emp_attendance WHERE emp_profile_id = ? AND emp_login_date = ?',
                [emp_profile_id, logoff_date]
            );

            if (existing.length > 0) {
                // Update logoff time
                const [result] = await pool.query(
                    'UPDATE emp_attendance SET emp_logoff_time = ? WHERE emp_profile_id = ? AND emp_login_date = ?',
                    [logoff_time, emp_profile_id, logoff_date]
                );
                return result;
            } else {
                // Create new record with logoff only (edge case)
                const [result] = await pool.query(
                    'INSERT INTO emp_attendance (emp_profile_id, emp_login_date, emp_logoff_time, emp_login_status) VALUES (?, ?, ?, 1)',
                    [emp_profile_id, logoff_date, logoff_time]
                );
                return result;
            }
        } catch (error) {
            throw error;
        }
    }

    // HR: Mark Employee as Absent
    static async markAbsent(emp_profile_id, absent_date) {
        try {
            // Check if attendance record exists for this date
            const [existing] = await pool.query(
                'SELECT emp_profile_id,emp_login_date,emp_login_time,emp_logoff_time,emp_login_status FROM emp_attendance WHERE emp_profile_id = ? AND emp_login_date = ?',
                [emp_profile_id, absent_date]
            );

            if (existing.length > 0) {
                // Update to mark as absent
                const [result] = await pool.query(
                    'UPDATE emp_attendance SET emp_login_time = NULL, emp_logoff_time = NULL, emp_login_status = 0 WHERE emp_profile_id = ? AND emp_login_date = ?',
                    [emp_profile_id, absent_date]
                );
                return result;
            } else {
                // Create new absent record
                const [result] = await pool.query(
                    'INSERT INTO emp_attendance (emp_profile_id, emp_login_date, emp_login_time, emp_logoff_time, emp_login_status) VALUES (?, ?, NULL, NULL, 0)',
                    [emp_profile_id, absent_date]
                );
                return result;
            }
        } catch (error) {
            throw error;
        }
    }

    // Get all employees attendance status by date
    static async getAllAttendanceByDate(date) {
        try {
            const [rows] = await pool.query(
                `SELECT e.emp_profile_id, e.emp_first_name, e.emp_last_name, e.emp_designation,
                a.id, a.emp_login_date, a.emp_login_time, a.emp_logoff_time, a.emp_login_status
                FROM employee_details e
                LEFT JOIN emp_attendance a ON e.emp_profile_id = a.emp_profile_id AND a.emp_login_date = ?
                WHERE e.is_active = 1
                ORDER BY a.emp_login_time DESC, e.emp_first_name ASC`,
                [date]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get attendance by emp_profile_id and date range
    static async getAttendanceByDateRange(emp_profile_id, startDate, endDate) {
        try {
            const [rows] = await pool.query(
                `SELECT a.id, a.emp_profile_id, a.emp_login_date, a.emp_login_time, a.emp_logoff_time, a.emp_login_status, 
                e.emp_first_name, e.emp_last_name, e.emp_designation,
                CASE 
                    WHEN a.emp_login_time IS NOT NULL AND a.emp_logoff_time IS NOT NULL 
                    THEN ROUND(TIME_TO_SEC(TIMEDIFF(a.emp_logoff_time, a.emp_login_time)) / 3600, 2)
                    ELSE 0 
                END as working_hours
                FROM emp_attendance a 
                LEFT JOIN employee_details e ON a.emp_profile_id = e.emp_profile_id 
                WHERE a.emp_profile_id = ? AND a.emp_login_date BETWEEN ? AND ? 
                ORDER BY a.emp_login_date DESC`,
                [emp_profile_id, startDate, endDate]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get all employees attendance by date range
    static async getAllAttendanceByDateRange(startDate, endDate) {
        try {
            const [rows] = await pool.query(
                `SELECT a.id, a.emp_profile_id, a.emp_login_date, a.emp_login_time, a.emp_logoff_time, a.emp_login_status, 
                e.emp_first_name, e.emp_last_name, e.emp_designation,
                CASE 
                    WHEN a.emp_login_time IS NOT NULL AND a.emp_logoff_time IS NOT NULL 
                    THEN ROUND(TIME_TO_SEC(TIMEDIFF(a.emp_logoff_time, a.emp_login_time)) / 3600, 2)
                    ELSE 0 
                END as working_hours 
                FROM emp_attendance a 
                LEFT JOIN employee_details e ON a.emp_profile_id = e.emp_profile_id 
                WHERE a.emp_login_date BETWEEN ? AND ? 
                ORDER BY a.emp_login_date DESC, a.emp_login_time DESC`,
                [startDate, endDate]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Attendance;
