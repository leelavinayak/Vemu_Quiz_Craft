const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../services/emailService');
const { notify } = require('../services/notificationService');
const templates = require('../utils/emailTemplates');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
    const { name, email, password, role, profilePic, collegeId, branch, year, collegeName } = req.body;

    // Block admin registration — admin access is only via hardcoded credentials
    if (role === 'admin') {
        return res.status(403).json({ message: 'Admin registration is not allowed. Contact the Programmers Club for admin access.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            profilePic,
            collegeId: collegeId || '',
            branch: branch || '',
            year: year || '',
            collegeName: collegeName || '',
            isVerified: role === 'admin' ? false : true // Admins need OTP verification
        });

        if (user) {
            if (role === 'admin') {
                // Generate and send OTP
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                await OTP.create({
                    email: user.email,
                    otp: otpCode,
                    type: 'register',
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                });

                await sendEmail({
                    email: user.email,
                    subject: 'Admin Registration OTP',
                    message: `Your OTP for admin registration is ${otpCode}.`,
                    html: templates.getOTPTemplate(otpCode, 'register')
                });

                // In-App Notification for new admin
                await notify(user._id, 'warning', 'Verification Pending', 'Please complete your administrative identity verification to access the dashboard.');

                return res.status(201).json({
                    message: 'Admin registered. Please verify OTP sent to email.',
                    isPendingVerification: true,
                    email: user.email
                });
            }

            // Trigger Welcome Notification
            if (user.role === 'student') {
                notify(user._id, 'success', 'Welcome to AIQuiz', 'Your account is ready. Exploration begins now.', {
                    html: templates.getWelcomeTemplate(user.name)
                });
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic,
                collegeId: user.collegeId,
                branch: user.branch,
                year: user.year,
                collegeName: user.collegeName,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public

// Hardcoded admin credentials — only this account gets admin access
const ADMIN_EMAIL = 'programmersclub2026@gmail.com';
const ADMIN_PASSWORD = 'programmersclubadmin@vemu';

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // --- Special Admin Login (hardcoded credentials) ---
        if (email === ADMIN_EMAIL) {
            if (password !== ADMIN_PASSWORD) {
                return res.status(401).json({ message: 'Invalid admin credentials' });
            }

            // Find or auto-create the admin user in DB
            let adminUser = await User.findOne({ email: ADMIN_EMAIL });
            if (!adminUser) {
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                adminUser = await User.create({
                    name: 'Programmers Club Admin',
                    email: ADMIN_EMAIL,
                    password: hashedPassword,
                    role: 'admin',
                    isVerified: true
                });
            }

            // Ensure role is always admin for this account
            if (adminUser.role !== 'admin') {
                adminUser.role = 'admin';
                await adminUser.save();
            }

            return res.json({
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: 'admin',
                profilePic: adminUser.profilePic,
                collegeId: adminUser.collegeId || '',
                branch: adminUser.branch || '',
                year: adminUser.year || '',
                collegeName: adminUser.collegeName || '',
                token: generateToken(adminUser._id)
            });
        }

        // --- Regular User Login (always treated as student) ---
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) {
                return res.status(401).json({
                    message: 'Account not verified. Please verify your OTP.',
                    isPendingVerification: true
                });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: 'student', // Always force student role for non-admin users
                profilePic: user.profilePic,
                collegeId: user.collegeId,
                branch: user.branch,
                year: user.year,
                collegeName: user.collegeName,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.error('UpdateProfile failed: req.user or req.user._id missing');
            return res.status(401).json({ message: 'User identity lost, please re-login' });
        }

        const user = await User.findById(req.user._id);
        if (user) {
            // Check if email is being changed and if it's already taken
            if (req.body.email && req.body.email !== user.email) {
                const emailExists = await User.findOne({ email: req.body.email });
                if (emailExists) {
                    return res.status(400).json({ message: 'Email already in use' });
                }
            }

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.profilePic !== undefined) user.profilePic = req.body.profilePic;
            if (req.body.collegeId !== undefined) user.collegeId = req.body.collegeId;
            if (req.body.branch !== undefined) user.branch = req.body.branch;
            if (req.body.year !== undefined) user.year = req.body.year;
            if (req.body.collegeName !== undefined) user.collegeName = req.body.collegeName;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePic: updatedUser.profilePic,
                collegeId: updatedUser.collegeId,
                branch: updatedUser.branch,
                year: updatedUser.year,
                collegeName: updatedUser.collegeName
            });
        } else {
            res.status(404).json({ message: 'User record not found' });
        }
    } catch (error) {
        console.error('Profile Update Backend Error:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error during profile update' });
    }
};

// @desc    Forgot Password - Request OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create({
            email,
            otp: otpCode,
            type: 'forgot',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendEmail({
            email,
            subject: 'Password Reset OTP',
            message: `Your OTP for resetting password is ${otpCode}.`,
            html: templates.getOTPTemplate(otpCode, 'forgot')
        });

        res.json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const otpRecord = await OTP.findOne({ email, otp, type: 'forgot' });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Registration OTP (for Admin)
// @route   POST /api/auth/verify-registration
// @access  Public
const verifyRegistration = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await OTP.findOne({ email, otp, type: 'register' });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User record not found' });
        }

        user.isVerified = true;
        await user.save();
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerStudent, loginUser, updateProfile, forgotPassword, resetPassword, verifyRegistration };
