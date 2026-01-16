const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All employee routes are protected with JWT authentication
router.get('/', verifyToken, employeeController.getAllEmployees);
router.get('/birthdays/today', verifyToken, employeeController.getTodaysBirthdays);
router.get('/birthdays', verifyToken, employeeController.getBirthdaysByMonth);
router.get('/search', verifyToken, employeeController.searchEmployees);
router.get('/:id', verifyToken, employeeController.getEmployeeById);

// Administrative operations (Requires administrator role)
router.post('/', verifyToken, isAdmin, employeeController.createEmployee);
router.put('/:id', verifyToken, isAdmin, employeeController.updateEmployee);
router.delete('/:id', verifyToken, isAdmin, employeeController.deleteEmployee);

module.exports = router;
