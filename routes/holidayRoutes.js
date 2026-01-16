const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Apply JWT authentication to all holiday routes
router.use(verifyToken);

// GET routes (Accessible to all authenticated users)
router.get('/', holidayController.getAllHolidays);
router.get('/year', holidayController.getHolidaysByYear);
router.get('/month', holidayController.getHolidaysByMonth);

// Administrative operations (Requires administrator role)
router.post('/', isAdmin, holidayController.addHoliday);
router.put('/:id', isAdmin, holidayController.updateHoliday);
router.delete('/:id', isAdmin, holidayController.deleteHoliday);

module.exports = router;
