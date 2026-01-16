const { pool } = require('../config/database');

class HolidayModel {
    // Get all holidays
    static async getAllHolidays() {
        const query = `
            SELECT id, holiday_date, holiday_name, 
                   DATE_FORMAT(holiday_date, '%Y-%m-%d') as formatted_date,
                   YEAR(holiday_date) as year,
                   MONTHNAME(holiday_date) as month
            FROM holidays 
            ORDER BY holiday_date ASC
        `;
        const [results] = await pool.query(query);
        return results;
    }

    // Get holidays by year
    static async getHolidaysByYear(year) {
        const query = `
            SELECT id, holiday_date, holiday_name, 
                   DATE_FORMAT(holiday_date, '%Y-%m-%d') as formatted_date,
                   YEAR(holiday_date) as year,
                   MONTHNAME(holiday_date) as month
            FROM holidays 
            WHERE YEAR(holiday_date) = ?
            ORDER BY holiday_date ASC
        `;
        const [results] = await pool.query(query, [year]);
        return results;
    }

    // Get holidays by month and year
    static async getHolidaysByMonth(year, month) {
        const query = `
            SELECT id, holiday_date, holiday_name, 
                   DATE_FORMAT(holiday_date, '%Y-%m-%d') as formatted_date,
                   YEAR(holiday_date) as year,
                   MONTHNAME(holiday_date) as month
            FROM holidays 
            WHERE YEAR(holiday_date) = ? AND MONTH(holiday_date) = ?
            ORDER BY holiday_date ASC
        `;
        const [results] = await pool.query(query, [year, month]);
        return results;
    }

    // Add a new holiday
    static async addHoliday(holidayDate, holidayName) {
        const query = `
            INSERT INTO holidays (holiday_date, holiday_name) 
            VALUES (?, ?)
        `;
        const [result] = await pool.query(query, [holidayDate, holidayName]);
        return result;
    }

    // Update a holiday
    static async updateHoliday(id, holidayDate, holidayName) {
        const query = `
            UPDATE holidays 
            SET holiday_date = ?, holiday_name = ?
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [holidayDate, holidayName, id]);
        return result;
    }

    // Delete a holiday
    static async deleteHoliday(id) {
        const query = `DELETE FROM holidays WHERE id = ?`;
        const [result] = await pool.query(query, [id]);
        return result;
    }
}

module.exports = HolidayModel;
