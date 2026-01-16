const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/login', authController.login);
router.post('/generate-token', authController.generateToken);
router.post('/verify-token', authController.verifyToken);

module.exports = router;
