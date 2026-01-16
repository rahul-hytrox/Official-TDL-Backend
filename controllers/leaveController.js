const Leave = require('../models/leaveModel');
const emailService = require('../config/emailService');

const leaveController = {
    // Request Leave
    requestLeave: async (req, res) => {
        try {
            const leaveData = req.body;

            // 1. SEND REAL EMAIL FIRST (requested modification)
            try {
                await emailService.sendLeaveRequestEmail(leaveData);
                console.log('✅ Mail sent successfully');
            } catch (emailErr) {
                console.error('❌ Mail failed to send:', emailErr);
                return res.status(400).json({
                    success: false,
                    message: 'Mail delivery failed. Please check your SMTP settings or HR email address.'
                });
            }

            // 2. ONLY IF MAIL SUCCESS, SAVE TO DATABASE
            try {
                const result = await Leave.create(leaveData);
                res.status(200).json({
                    success: true,
                    message: 'Mail sent successfully and record saved in database.',
                    applicationId: result.insertId
                });
            } catch (dbError) {
                console.error('❌ Database save failed after email success:', dbError);
                // Return a specific message so frontend knows mail went but DB didn't
                res.status(500).json({
                    success: false,
                    message: 'Mail was sent, but we failed to save the record in the database. Please contact Admin.'
                });
            }
        } catch (error) {
            console.error('Leave Controller Error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    // Get Employee Leaves
    getEmployeeLeaves: async (req, res) => {
        try {
            const { empProfileId } = req.params;
            const results = await Leave.getByEmployeeId(empProfileId);
            res.status(200).json({ success: true, data: results });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ success: false, message: 'Database error' });
        }
    },

    // Admin: Get all leave applications
    getAllLeaves: async (req, res) => {
        try {
            const results = await Leave.getAll();
            res.status(200).json({ success: true, data: results });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ success: false, message: 'Database error' });
        }
    },

    // Update leave application (Admin)
    updateLeave: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, leaveType } = req.body;

            const validStatuses = ['Approved', 'Rejected', 'Pending'];
            const validTypes = ['Sick leave', 'Paid leave', 'LOP', 'Optional holiday'];

            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            if (leaveType && !validTypes.includes(leaveType)) {
                return res.status(400).json({ success: false, message: 'Invalid leave type' });
            }

            const result = await Leave.update(id, { status, leave_type: leaveType });
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Application not found' });
            }

            res.status(200).json({ success: true, message: `Application updated successfully` });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ success: false, message: 'Database error' });
        }
    }
};

module.exports = leaveController;
