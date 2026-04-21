const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    profilePic: { type: String, default: '' },
    // Academic Details
    collegeId: { type: String, default: '' },
    branch: { type: String, default: '' },
    year: { type: String, default: '' },
    collegeName: { type: String, default: '' },
    isVerified: { type: Boolean, default: true }, // Default true for students, false for new admins
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
