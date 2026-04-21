const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    type: { type: String, enum: ['forgot', 'register'], required: true },
    expiresAt: { type: Date, required: true, index: { expires: '10m' } },
    createdAt: { type: Date, default: Date.now }
});

// Automatically delete after 10 minutes (handled by the index expires)
module.exports = mongoose.model('OTP', otpSchema);
