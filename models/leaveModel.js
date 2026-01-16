const { pool } = require('../config/database');

class Leave {
    // Save leave application
    static async create(leaveData) {
        try {
            const {
                employeeId,
                startDate,
                endDate,
                leaveType,
                leaveDuration,
                reason,
                reportingManager
            } = leaveData;

            const query = `
                INSERT INTO leave_applications 
                (emp_profile_id, start_date, end_date, leave_type, leave_duration, reason, reporting_manager) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await pool.query(query, [
                employeeId,
                startDate,
                endDate,
                leaveType,
                leaveDuration,
                reason,
                reportingManager
            ]);

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Get all leave applications for an employee
    static async getByEmployeeId(empProfileId) {
        try {
            const query = 'SELECT * FROM leave_applications WHERE emp_profile_id = ? ORDER BY created_at DESC';
            const [rows] = await pool.query(query, [empProfileId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Admin: Get all leave applications
    static async getAll() {
        try {
            const query = `
                SELECT l.*, e.emp_first_name, e.emp_last_name 
                FROM leave_applications l
                JOIN employee_details e ON l.emp_profile_id = e.emp_profile_id
                ORDER BY l.created_at DESC
            `;
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Update leave application
    static async update(id, updateData) {
        try {
            const { status, leave_type } = updateData;
            const query = 'UPDATE leave_applications SET status = ?, leave_type = ? WHERE id = ?';
            const [result] = await pool.query(query, [status, leave_type, id]);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Leave;
