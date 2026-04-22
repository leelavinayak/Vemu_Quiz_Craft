const Notification = require('../models/Notification');
const sendEmail = require('./emailService');
const templates = require('../utils/emailTemplates');
const User = require('../models/User');

/**
 * Unified Notification Service
 * Handles both DB notifications and Email delivery
 */
const notify = async (userId, type, title, message, emailOptions = null) => {
    try {
        // 1. Create In-App Notification
        await Notification.create({
            userId,
            type: type || 'info',
            message: `${title}: ${message}`
        });

        // 2. Send Email if options provided
        if (emailOptions) {
            const user = await User.findById(userId);
            if (user && user.email) {
                await sendEmail({
                    email: user.email,
                    subject: emailOptions.subject || title,
                    message: message, // fallback text
                    html: emailOptions.html
                });
            }
        }
    } catch (error) {
        console.error('Notification Service Error:', error.message);
        // We don't throw here to prevent crashing the main request flow
    }
};

/**
 * Notify All Students
 */
const notifyAllStudents = async (title, message, emailHtml = null) => {
    try {
        const students = await User.find({ role: 'student' });
        
        const notifications = students.map(student => ({
            userId: student._id,
            type: 'info',
            message: `${title}: ${message}`
        }));

        // Bulk insert DB notifications
        await Notification.insertMany(notifications);

        // Send emails (Warning: Instant blast, might need queuing for large sets)
        if (emailHtml) {
            for (const student of students) {
                sendEmail({
                    email: student.email,
                    subject: title,
                    message: message,
                    html: emailHtml
                }).catch(err => console.error(`Email failed for ${student.email}:`, err.message));
            }
        }
    } catch (error) {
        console.error('Notify All Students Error:', error.message);
    }
};

module.exports = {
    notify,
    notifyAllStudents
};
