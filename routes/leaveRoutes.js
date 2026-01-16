const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// All routes are prefixed with /api/leave (registered in server.js)
router.post('/request', leaveController.requestLeave);
router.get('/employee/:empProfileId', leaveController.getEmployeeLeaves);
router.get('/all', leaveController.getAllLeaves);
router.put('/status/:id', leaveController.updateLeave);

module.exports = router;
