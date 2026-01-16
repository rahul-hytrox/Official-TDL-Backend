-- ILEM Attendance Management System Database Schema

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS expro_attendance;
USE expro_attendance;

-- Employee Details Table
CREATE TABLE IF NOT EXISTS employee_details (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_profile_id VARCHAR(50) NOT NULL UNIQUE,
    emp_first_name VARCHAR(100) NOT NULL,
    emp_middle_name VARCHAR(100),
    emp_last_name VARCHAR(100) NOT NULL,
    emp_dob DATE NOT NULL,
    emp_contact_number VARCHAR(15) NOT NULL UNIQUE,
    emp_email_id VARCHAR(255) NOT NULL UNIQUE,
    emp_designation VARCHAR(100) NOT NULL,
    emp_join_date DATE NOT NULL,
    emp_pan_number VARCHAR(10) UNIQUE,
    emp_adhar_number VARCHAR(12) UNIQUE,
    emp_password VARCHAR(255) NOT NULL,
    emp_role ENUM('administrator', 'employee') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_emp_profile_id (emp_profile_id),
    INDEX idx_emp_email (emp_email_id),
    INDEX idx_emp_contact (emp_contact_number),
    INDEX idx_emp_name (emp_first_name, emp_last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Attendance Table
CREATE TABLE IF NOT EXISTS emp_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emp_profile_id VARCHAR(50) NOT NULL,
    emp_login_date DATE NOT NULL,
    emp_login_time TIME,
    emp_logoff_time TIME,
    emp_login_status TINYINT(1) DEFAULT 0 COMMENT '0=Absent, 1=Present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_profile_id) REFERENCES employee_details(emp_profile_id) ON DELETE CASCADE,
    INDEX idx_emp_profile_date (emp_profile_id, emp_login_date),
    INDEX idx_login_date (emp_login_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Break Time Table
CREATE TABLE IF NOT EXISTS emp_break_time (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emp_profile_id VARCHAR(50) NOT NULL,
    emp_login_date DATE NOT NULL,
    emp_login_status TINYINT(1) DEFAULT 0 COMMENT '0=Absent, 1=Present',
    emp_lunch_break_start_time TIME DEFAULT '00:00:00',
    emp_lunch_break_end_time TIME DEFAULT '00:00:00',
    emp_tea_break_1_start_time TIME DEFAULT '00:00:00',
    emp_tea_break_1_end_time TIME DEFAULT '00:00:00',
    emp_tea_break_2_start_time TIME DEFAULT '00:00:00',
    emp_tea_break_2_end_time TIME DEFAULT '00:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_profile_id) REFERENCES employee_details(emp_profile_id) ON DELETE CASCADE,
    INDEX idx_emp_profile_date_break (emp_profile_id, emp_login_date),
    INDEX idx_login_date_break (emp_login_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Holidays Table
CREATE TABLE IF NOT EXISTS holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    holiday_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_holiday_date (holiday_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave Applications Table
CREATE TABLE IF NOT EXISTS leave_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emp_profile_id VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type ENUM('Sick leave', 'Earned leave', 'Unpaid leave', 'Optional holiday') NOT NULL,
    leave_duration ENUM('Full Day', 'Half Day') NOT NULL,
    reason TEXT NOT NULL,
    reporting_manager VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (emp_profile_id) REFERENCES employee_details(emp_profile_id) ON DELETE CASCADE,
    INDEX idx_emp_profile_leave (emp_profile_id),
    INDEX idx_leave_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
