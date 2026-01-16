const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using SMTP configuration from .env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    pool: true, // Use connection pooling for MUCH faster delivery
    maxConnections: 5,
    maxMessages: 100,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.warn('⚠️ Email Transporter Warning: Check your SMTP credentials in .env');
    } else {
        console.log('📧 Email Server is ready to send messages');
    }
});

const emailService = {
    sendLeaveRequestEmail: async (leaveData) => {
        const {
            fullName,
            emailId,
            employeeId,
            startDate,
            endDate,
            leaveType,
            leaveDuration,
            reason,
            reportingManager,
            department
        } = leaveData;

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: process.env.HR_EMAIL,
            cc: emailId, // CC to the employee
            subject: `Leave Application: ${fullName} (${employeeId}) - ${leaveType}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 0;">Leave Application</h2>
                    </div>
                    <div style="padding: 30px;">
                        <p>Hello HR,</p>
                        <p>A new leave application has been submitted by an employee. Details are as follows:</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Employee Name</td>
                                <td style="padding: 10px; border: 1px solid #eee;">${fullName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Employee ID</td>
                                <td style="padding: 10px; border: 1px solid #eee;">${employeeId}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Department</td>
                                <td style="padding: 10px; border: 1px solid #eee;">${department}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Leave Type</td>
                                <td style="padding: 10px; border: 1px solid #eee;">${leaveType}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Duration</td>
                                <td style="padding: 10px; border: 1px solid #eee;">${leaveDuration}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Dates</td>
                                <td style="padding: 10px; border: 1px solid #eee;">${startDate} to ${endDate}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Reporting Manager</td>
                                <td style="padding: 10px; border: 1px solid #eee;">${reportingManager}</td>
                            </tr>
                        </table>

                        <p style="font-weight: bold; margin-top: 25px;">Reason for Leave:</p>
                        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            ${reason}
                        </div>

                        <p style="margin-top: 30px; font-size: 14px; color: #666;">
                            This is an automated email from the ILEM Attendance Portal.
                        </p>
                    </div>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Real Email Sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email Send Error:', error);
            throw error;
        }
    }
};

module.exports = emailService;
