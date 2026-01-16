const HolidayModel = require('../models/holidayModel');

// Get all holidays
exports.getAllHolidays = async (req, res, next) => {
    try {
        const holidays = await HolidayModel.getAllHolidays();

        res.status(200).json({
            success: true,
            count: holidays.length,
            data: holidays
        });
    } catch (error) {
        next(error);
    }
};

// Get holidays by year
exports.getHolidaysByYear = async (req, res, next) => {
    try {
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: 'Year is required. Example: ?year=2024'
            });
        }

        // Validate year format
        if (!/^\d{4}$/.test(year)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year format. Use 4-digit year (e.g., 2024)'
            });
        }

        const holidays = await HolidayModel.getHolidaysByYear(year);

        res.status(200).json({
            success: true,
            year: parseInt(year),
            count: holidays.length,
            data: holidays
        });
    } catch (error) {
        next(error);
    }
};

// Get holidays by month
exports.getHolidaysByMonth = async (req, res, next) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Year and month are required. Example: ?year=2024&month=1'
            });
        }

        // Validate year format
        if (!/^\d{4}$/.test(year)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year format. Use 4-digit year (e.g., 2024)'
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

        const holidays = await HolidayModel.getHolidaysByMonth(year, monthNum);

        res.status(200).json({
            success: true,
            year: parseInt(year),
            month: monthNum,
            count: holidays.length,
            data: holidays
        });
    } catch (error) {
        next(error);
    }
};

// Add a new holiday
exports.addHoliday = async (req, res, next) => {
    try {
        const { holiday_date, holiday_name } = req.body;

        if (!holiday_date || !holiday_name) {
            return res.status(400).json({
                success: false,
                message: 'holiday_date and holiday_name are required'
            });
        }

        const result = await HolidayModel.addHoliday(holiday_date, holiday_name);

        res.status(201).json({
            success: true,
            message: 'Holiday added successfully',
            data: {
                id: result.insertId,
                holiday_date,
                holiday_name
            }
        });
    } catch (error) {
        // Handle duplicate date error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Holiday already exists for this date'
            });
        }
        next(error);
    }
};

// Update a holiday
exports.updateHoliday = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { holiday_date, holiday_name } = req.body;

        if (!holiday_date || !holiday_name) {
            return res.status(400).json({
                success: false,
                message: 'holiday_date and holiday_name are required'
            });
        }

        const result = await HolidayModel.updateHoliday(id, holiday_date, holiday_name);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Holiday updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Delete a holiday
exports.deleteHoliday = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await HolidayModel.deleteHoliday(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Holiday deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
