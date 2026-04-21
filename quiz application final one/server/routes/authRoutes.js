const express = require('express');
const router = express.Router();
const { 
    registerStudent, 
    loginUser, 
    updateProfile, 
    forgotPassword, 
    resetPassword, 
    verifyRegistration 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerStudent);
router.post('/login', loginUser);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-registration', verifyRegistration);

module.exports = router;
