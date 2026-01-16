const { pool } = require('../config/database');

class BreakTime {
    // Create or update break time record
    static async recordBreak(breakData) {
        try {
            const {
                emp_profile_id,
                emp_login_date,
                emp_login_status,
                breakType,
                startTime,
                endTime
            } = breakData;

            // Check if record exists
            const [existing] = await pool.query(
                'SELECT emp_profile_id, emp_login_date, emp_login_status FROM emp_break_time WHERE emp_profile_id = ? AND emp_login_date = ?',
                [emp_profile_id, emp_login_date]
            );

            if (existing.length > 0) {
                // Update existing record based on break type
                let updateQuery = '';
                let params = [];

                if (breakType === 'lunch') {
                    updateQuery = 'UPDATE emp_break_time SET emp_lunch_break_start_time = ?, emp_lunch_break_end_time = ?, emp_login_status = ? WHERE emp_profile_id = ? AND emp_login_date = ?';
                    params = [startTime, endTime, emp_login_status, emp_profile_id, emp_login_date];
                } else if (breakType === 'tea1') {
                    updateQuery = 'UPDATE emp_break_time SET emp_tea_break_1_start_time = ?, emp_tea_break_1_end_time = ?, emp_login_status = ? WHERE emp_profile_id = ? AND emp_login_date = ?';
                    params = [startTime, endTime, emp_login_status, emp_profile_id, emp_login_date];
                } else if (breakType === 'tea2') {
                    updateQuery = 'UPDATE emp_break_time SET emp_tea_break_2_start_time = ?, emp_tea_break_2_end_time = ?, emp_login_status = ? WHERE emp_profile_id = ? AND emp_login_date = ?';
                    params = [startTime, endTime, emp_login_status, emp_profile_id, emp_login_date];
                }

                const [result] = await pool.query(updateQuery, params);
                return result;
            } else {
                // Create new record with default 00:00:00 for all breaks
                let insertData = {
                    emp_profile_id,
                    emp_login_date,
                    emp_login_status,
                    emp_lunch_break_start_time: '00:00:00',
                    emp_lunch_break_end_time: '00:00:00',
                    emp_tea_break_1_start_time: '00:00:00',
                    emp_tea_break_1_end_time: '00:00:00',
                    emp_tea_break_2_start_time: '00:00:00',
                    emp_tea_break_2_end_time: '00:00:00'
                };

                // Set specific break times
                if (breakType === 'lunch') {
                    insertData.emp_lunch_break_start_time = startTime;
                    insertData.emp_lunch_break_end_time = endTime;
                } else if (breakType === 'tea1') {
                    insertData.emp_tea_break_1_start_time = startTime;
                    insertData.emp_tea_break_1_end_time = endTime;
                } else if (breakType === 'tea2') {
                    insertData.emp_tea_break_2_start_time = startTime;
                    insertData.emp_tea_break_2_end_time = endTime;
                }

                const [result] = await pool.query(
                    `INSERT INTO emp_break_time 
                    (emp_profile_id, emp_login_date, emp_login_status, 
                    emp_lunch_break_start_time, emp_lunch_break_end_time,
                    emp_tea_break_1_start_time, emp_tea_break_1_end_time,
                    emp_tea_break_2_start_time, emp_tea_break_2_end_time) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        insertData.emp_profile_id,
                        insertData.emp_login_date,
                        insertData.emp_login_status,
                        insertData.emp_lunch_break_start_time,
                        insertData.emp_lunch_break_end_time,
                        insertData.emp_tea_break_1_start_time,
                        insertData.emp_tea_break_1_end_time,
                        insertData.emp_tea_break_2_start_time,
                        insertData.emp_tea_break_2_end_time
                    ]
                );
                return result;
            }
        } catch (error) {
            throw error;
        }
    }

    // HR: Mark all breaks as absent for an employee (single request for all breaks)
    static async markAllBreaksAbsent(emp_profile_id, absent_date) {
        try {
            // Check if record exists
            const [existing] = await pool.query(
                'SELECT emp_profile_id, emp_login_date FROM emp_break_time WHERE emp_profile_id = ? AND emp_login_date = ?',
                [emp_profile_id, absent_date]
            );

            if (existing.length > 0) {
                // Update existing record - set all breaks to 00:00:00 and status to 0
                const [result] = await pool.query(
                    `UPDATE emp_break_time SET 
                    emp_login_status = 0,
                    emp_lunch_break_start_time = '00:00:00',
                    emp_lunch_break_end_time = '00:00:00',
                    emp_tea_break_1_start_time = '00:00:00',
                    emp_tea_break_1_end_time = '00:00:00',
                    emp_tea_break_2_start_time = '00:00:00',
                    emp_tea_break_2_end_time = '00:00:00'
                    WHERE emp_profile_id = ? AND emp_login_date = ?`,
                    [emp_profile_id, absent_date]
                );
                return result;
            } else {
                // Create new absent record with all breaks set to 00:00:00
                const [result] = await pool.query(
                    `INSERT INTO emp_break_time 
                    (emp_profile_id, emp_login_date, emp_login_status, 
                    emp_lunch_break_start_time, emp_lunch_break_end_time,
                    emp_tea_break_1_start_time, emp_tea_break_1_end_time,
                    emp_tea_break_2_start_time, emp_tea_break_2_end_time) 
                    VALUES (?, ?, 0, '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00', '00:00:00')`,
                    [emp_profile_id, absent_date]
                );
                return result;
            }
        } catch (error) {
            throw error;
        }
    }

    // Get all employees break records by date range
    static async getAllBreaksByDateRange(startDate, endDate) {
        try {
            const [rows] = await pool.query(
                `SELECT b.emp_profile_id, b.emp_login_date, b.emp_login_status, 
                b.emp_lunch_break_start_time, b.emp_lunch_break_end_time,
                b.emp_tea_break_1_start_time, b.emp_tea_break_1_end_time,
                b.emp_tea_break_2_start_time, b.emp_tea_break_2_end_time,
                e.emp_first_name, e.emp_last_name, e.emp_designation 
                FROM emp_break_time b 
                LEFT JOIN employee_details e ON b.emp_profile_id = e.emp_profile_id 
                WHERE b.emp_login_date BETWEEN ? AND ? 
                ORDER BY b.emp_login_date DESC`,
                [startDate, endDate]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get specific employee break records by date range
    static async getEmployeeBreaksByDateRange(emp_profile_id, startDate, endDate) {
        try {
            const [rows] = await pool.query(
                `SELECT b.emp_profile_id, b.emp_login_date, b.emp_login_status, 
                b.emp_lunch_break_start_time, b.emp_lunch_break_end_time,
                b.emp_tea_break_1_start_time, b.emp_tea_break_1_end_time,
                b.emp_tea_break_2_start_time, b.emp_tea_break_2_end_time
                FROM emp_break_time b
                WHERE b.emp_profile_id = ? AND b.emp_login_date BETWEEN ? AND ? 
                ORDER BY b.emp_login_date DESC`,
                [emp_profile_id, startDate, endDate]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
    // Get full daily activity (attendance + breaks) for an employee
    static async getDailyActivity(emp_profile_id, login_date) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    a.emp_login_date, a.emp_login_time, a.emp_logoff_time, a.emp_login_status as attendance_status,
                    b.emp_lunch_break_start_time, b.emp_lunch_break_end_time,
                    b.emp_tea_break_1_start_time, b.emp_tea_break_1_end_time,
                    b.emp_tea_break_2_start_time, b.emp_tea_break_2_end_time,
                    b.emp_login_status as break_status
                FROM emp_attendance a
                LEFT JOIN emp_break_time b ON a.emp_profile_id = b.emp_profile_id AND a.emp_login_date = b.emp_login_date
                WHERE a.emp_profile_id = ? AND a.emp_login_date = ?`,
                [emp_profile_id, login_date]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Get attendance status for logic sync
    static async getAttendanceStatus(emp_profile_id, login_date) {
        try {
            const [rows] = await pool.query(
                'SELECT emp_login_status FROM emp_attendance WHERE emp_profile_id = ? AND emp_login_date = ?',
                [emp_profile_id, login_date]
            );

            if (rows.length === 0) return null;
            return rows[0].emp_login_status;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = BreakTime;
