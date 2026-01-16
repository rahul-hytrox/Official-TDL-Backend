const Employee = require('../models/employeeModel');

// Get all employees
exports.getAllEmployees = async (req, res, next) => {
    try {
        const employees = await Employee.getAll();
        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        next(error);
    }
};

// Get employee by Profile ID
exports.getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employee = await Employee.getByProfileId(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        next(error);
    }
};

// Create new employee
exports.createEmployee = async (req, res, next) => {
    try {
        const employeeData = req.body;

        // Validation
        const requiredFields = [
            'emp_profile_id',
            'emp_first_name',
            'emp_last_name',
            'emp_dob',
            'emp_contact_number',
            'emp_email_id',
            'emp_designation',
            'emp_join_date',
            'emp_password'
        ];

        const missingFields = requiredFields.filter(field => !employeeData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                missingFields
            });
        }

        // Check if profile ID already exists
        const existingProfileId = await Employee.getByProfileId(employeeData.emp_profile_id);
        if (existingProfileId) {
            return res.status(409).json({
                success: false,
                message: 'Employee with this profile ID already exists'
            });
        }

        // Check if email already exists
        const existingEmployee = await Employee.getByEmail(employeeData.emp_email_id);
        if (existingEmployee) {
            return res.status(409).json({
                success: false,
                message: 'Employee with this email already exists'
            });
        }

        const employeeProfileId = await Employee.create(employeeData);
        const newEmployee = await Employee.getByProfileId(employeeProfileId);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: newEmployee
        });
    } catch (error) {
        // Handle duplicate entry errors specifically for emp_profile_id or other unique fields
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Duplicate entry: Profile ID, Email, contact number, PAN, or Aadhaar already exists'
            });
        }
        next(error);
    }
};

// Update employee
exports.updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employeeData = req.body;

        // Check if employee exists
        const existingEmployee = await Employee.getByProfileId(id);
        if (!existingEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const affectedRows = await Employee.update(id, employeeData);

        if (affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'No changes made'
            });
        }

        const updatedEmployee = await Employee.getByProfileId(id);

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: updatedEmployee
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Duplicate entry: Email, contact number, PAN, or Aadhaar already exists'
            });
        }
        next(error);
    }
};

// Delete employee (soft delete)
exports.deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if employee exists
        const existingEmployee = await Employee.getByProfileId(id);
        if (!existingEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        await Employee.delete(id);

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Search employees
exports.searchEmployees = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const employees = await Employee.search(q);

        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        next(error);
    }
};

// Update employee password
exports.updatePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Check if employee exists
        const employee = await Employee.getByProfileId(id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Verify current password
        const isPasswordValid = await Employee.verifyPassword(id, currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        await Employee.updatePassword(id, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Reset password by email
exports.resetPassword = async (req, res, next) => {
    try {
        const { emp_email_id, newPassword } = req.body;

        // Validation
        if (!emp_email_id || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email and new password are required'
            });
        }

        // Check if employee exists
        const employee = await Employee.getByEmail(emp_email_id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found with this email'
            });
        }

        // Reset password
        const affectedRows = await Employee.resetPasswordByEmail(emp_email_id, newPassword);

        if (affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to reset password'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get employee birthdays by month
exports.getBirthdaysByMonth = async (req, res, next) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Month is required. Example: ?month=1'
            });
        }

        // Validate month (1-12)
        const monthNum = parseInt(month);
        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Invalid month. Use values between 1-12'
            });
        }

        const employees = await Employee.getBirthdaysByMonth(monthNum);

        const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        res.status(200).json({
            success: true,
            month: monthNum,
            month_name: monthNames[monthNum],
            count: employees.length,
            data: employees
        });
    } catch (error) {
        next(error);
    }
};

// Get today's birthdays
exports.getTodaysBirthdays = async (req, res, next) => {
    try {
        const employees = await Employee.getTodaysBirthdays();

        const today = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        res.status(200).json({
            success: true,
            date: today.toISOString().split('T')[0],
            day: today.getDate(),
            month: today.getMonth() + 1,
            month_name: monthNames[today.getMonth()],
            count: employees.length,
            data: employees
        });
    } catch (error) {
        next(error);
    }
};
