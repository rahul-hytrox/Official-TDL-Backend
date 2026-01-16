const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Employee {
    // Get all employees
    static async getAll() {
        try {
            const [rows] = await pool.query(
                'SELECT emp_profile_id, emp_first_name, emp_middle_name, emp_last_name, emp_dob, emp_contact_number, emp_email_id, emp_designation, emp_join_date, emp_role FROM employee_details WHERE is_active = TRUE ORDER BY emp_id DESC'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get employee by ID (internal use)
    static async getById(empId) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM employee_details WHERE emp_id = ? AND is_active = TRUE',
                [empId]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Get employee by Profile ID (primary public method)
    static async getByProfileId(empProfileId) {
        try {
            const [rows] = await pool.query(
                'SELECT emp_profile_id, emp_first_name, emp_middle_name, emp_last_name, emp_dob, emp_contact_number, emp_email_id, emp_designation, emp_join_date, emp_role FROM employee_details WHERE emp_profile_id = ? AND is_active = TRUE',
                [empProfileId]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Get employee by email
    static async getByEmail(email) {
        try {
            const [rows] = await pool.query(
                'SELECT emp_profile_id, emp_first_name, emp_middle_name, emp_last_name, emp_dob, emp_contact_number, emp_email_id, emp_designation, emp_join_date, emp_role FROM employee_details WHERE emp_email_id = ? AND is_active = TRUE',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Create new employee
    static async create(employeeData) {
        try {
            const {
                emp_profile_id,
                emp_first_name,
                emp_middle_name,
                emp_last_name,
                emp_dob,
                emp_contact_number,
                emp_email_id,
                emp_designation,
                emp_join_date,
                emp_pan_number,
                emp_adhar_number,
                emp_password
            } = employeeData;

            // Hash password
            const hashedPassword = await bcrypt.hash(emp_password, 10);

            const [result] = await pool.query(
                `INSERT INTO employee_details 
                (emp_profile_id, emp_first_name, emp_middle_name, emp_last_name, emp_dob, emp_contact_number, 
                emp_email_id, emp_designation, emp_join_date, emp_pan_number, emp_adhar_number, emp_password, emp_role) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    emp_profile_id,
                    emp_first_name,
                    emp_middle_name || null,
                    emp_last_name,
                    emp_dob,
                    emp_contact_number,
                    emp_email_id,
                    emp_designation,
                    emp_join_date,
                    emp_pan_number || null,
                    emp_adhar_number || null,
                    hashedPassword,
                    employeeData.emp_role || 'employee'
                ]
            );

            return emp_profile_id;
        } catch (error) {
            throw error;
        }
    }

    // Update employee by Profile ID
    // static async update(empProfileId, employeeData) {
    //     try {
    //         const {
    //             emp_first_name,
    //             emp_middle_name,
    //             emp_last_name,
    //             emp_dob,
    //             emp_contact_number,
    //             emp_email_id,
    //             emp_designation,
    //             emp_join_date,
    //             emp_pan_number,
    //             emp_adhar_number
    //         } = employeeData;

    //         const [result] = await pool.query(
    //             `UPDATE employee_details SET 
    //             emp_first_name = ?, emp_middle_name = ?, emp_last_name = ?, emp_dob = ?, 
    //             emp_contact_number = ?, emp_email_id = ?, emp_designation = ?, 
    //             emp_join_date = ?, emp_pan_number = ?, emp_adhar_number = ?
    //             WHERE emp_profile_id = ? AND is_active = TRUE`,
    //             [
    //                 emp_first_name,
    //                 emp_middle_name || null,
    //                 emp_last_name,
    //                 emp_dob,
    //                 emp_contact_number,
    //                 emp_email_id,
    //                 emp_designation,
    //                 emp_join_date,
    //                 emp_pan_number || null,
    //                 emp_adhar_number || null,
    //                 empProfileId
    //             ]
    //         );

    //         return result.affectedRows;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    static async update(empProfileId, employeeData) { // Update employee by Profile ID
        try {
            // Whitelist (only these fields are allowed to be updated)
            const allowedFields = {
                emp_first_name: "emp_first_name",
                emp_middle_name: "emp_middle_name",
                emp_last_name: "emp_last_name",
                emp_dob: "emp_dob",
                emp_contact_number: "emp_contact_number",
                emp_email_id: "emp_email_id",
                emp_designation: "emp_designation",
                emp_join_date: "emp_join_date",
                emp_pan_number: "emp_pan_number",
                emp_adhar_number: "emp_adhar_number",
                emp_role: "emp_role",
            };

            const setParts = [];
            const values = [];

            // Only update fields that are PRESENT in request body
            for (const key of Object.keys(employeeData)) {
                if (!allowedFields[key]) continue; // ignore unknown fields

                const val = employeeData[key];

                // If frontend sends "" for non-edited fields, ignore it
                // (prevents overwriting DB with blank)
                if (val === undefined) continue;
                if (typeof val === "string" && val.trim() === "") continue;

                setParts.push(`${allowedFields[key]} = ?`);
                values.push(val);
            }

            // If request has no updatable fields
            if (setParts.length === 0) return 0;

            const sql = `
        UPDATE employee_details
        SET ${setParts.join(", ")}
        WHERE emp_profile_id = ? AND is_active = TRUE
        `;

            values.push(empProfileId);

            const [result] = await pool.query(sql, values);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }


    // Soft delete employee by Profile ID
    static async delete(empProfileId) {
        try {
            const [result] = await pool.query(
                'UPDATE employee_details SET is_active = FALSE WHERE emp_profile_id = ?',
                [empProfileId]
            );
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    // Search employees
    static async search(searchTerm) {
        try {
            const [rows] = await pool.query(
                `SELECT emp_profile_id, emp_first_name, emp_middle_name, emp_last_name, emp_dob, emp_contact_number, emp_email_id, emp_designation, emp_join_date FROM employee_details 
                WHERE is_active = TRUE AND (
                    emp_first_name LIKE ? OR 
                    emp_last_name LIKE ? OR 
                    emp_email_id LIKE ? OR 
                    emp_contact_number LIKE ?
                )
                ORDER BY emp_id DESC`,
                [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Update password by Profile ID
    static async updatePassword(empProfileId, newPassword) {
        try {
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const [result] = await pool.query(
                'UPDATE employee_details SET emp_password = ? WHERE emp_profile_id = ? AND is_active = TRUE',
                [hashedPassword, empProfileId]
            );

            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    // Reset password by email
    static async resetPasswordByEmail(email, newPassword) {
        try {
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const [result] = await pool.query(
                'UPDATE employee_details SET emp_password = ? WHERE emp_email_id = ? AND is_active = TRUE',
                [hashedPassword, email]
            );

            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    // Verify password by Profile ID
    static async verifyPassword(empProfileId, password) {
        try {
            const [rows] = await pool.query(
                'SELECT emp_password FROM employee_details WHERE emp_profile_id = ? AND is_active = TRUE',
                [empProfileId]
            );

            if (rows.length === 0) {
                return false;
            }

            return await bcrypt.compare(password, rows[0].emp_password);
        } catch (error) {
            throw error;
        }
    }

    // Get employees by birthday month
    static async getBirthdaysByMonth(month) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    emp_profile_id, 
                    emp_first_name, 
                    emp_middle_name, 
                    emp_last_name, 
                    emp_dob,
                    DATE_FORMAT(emp_dob, '%Y-%m-%d') as formatted_dob,
                    DAY(emp_dob) as birth_day,
                    MONTHNAME(emp_dob) as birth_month,
                    emp_contact_number, 
                    emp_email_id, 
                    emp_designation 
                FROM employee_details 
                WHERE MONTH(emp_dob) = ? AND is_active = TRUE
                ORDER BY DAY(emp_dob) ASC`,
                [month]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get employees with birthdays today
    static async getTodaysBirthdays() {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    emp_profile_id, 
                    emp_first_name, 
                    emp_middle_name, 
                    emp_last_name, 
                    emp_dob,
                    DATE_FORMAT(emp_dob, '%Y-%m-%d') as formatted_dob,
                    TIMESTAMPDIFF(YEAR, emp_dob, CURDATE()) as age,
                    emp_contact_number, 
                    emp_email_id, 
                    emp_designation 
                FROM employee_details 
                WHERE MONTH(emp_dob) = MONTH(CURDATE()) 
                  AND DAY(emp_dob) = DAY(CURDATE()) 
                  AND is_active = TRUE
                ORDER BY emp_first_name ASC`
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
    // Login employee
    static async login(email, password) {
        try {
            // Get employee with password for verification
            const [rows] = await pool.query(
                'SELECT emp_id, emp_profile_id, emp_email_id, emp_password, emp_role, emp_first_name, emp_last_name, emp_designation FROM employee_details WHERE emp_email_id = ? AND is_active = TRUE',
                [email]
            );

            if (rows.length === 0) {
                return null;
            }

            const employee = rows[0];
            const isMatch = await bcrypt.compare(password, employee.emp_password);

            if (!isMatch) {
                return null;
            }

            // Remove password before returning
            delete employee.emp_password;
            return employee;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Employee;
