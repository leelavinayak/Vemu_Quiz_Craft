const supabase = require('../config/supabase');
const sendEmail = require('./emailService');
const templates = require('../utils/emailTemplates');

/**
 * Unified Notification Service
 * Handles both DB notifications and Email delivery
 */
const notify = async (userId, type, title, message, emailOptions = null) => {
    try {
        // 1. Create In-App Notification
        await supabase.from('notifications').insert([{
            userId,
            type: type || 'info',
            message: `${title}: ${message}`
        }]);

        // 2. Send Email if options provided
        if (emailOptions) {
            const { data: user } = await supabase
                .from('users')
                .select('email')
                .eq('id', userId)
                .single();

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
 * Notify Targeted Students
 * @param {Object} filters - { targetYears: [], targetBranches: [], targetSections: [] }
 */
const notifyAllStudents = async (title, message, emailHtml = null, filters = {}) => {
    try {
        const { data: students } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'student');
        
        if (students && students.length > 0) {
            // Apply Filters if provided
            const targetedStudents = students.filter(student => {
                const sYear = String(student.year || '').trim();
                const sBranch = String(student.branch || '').trim();
                const sSection = String(student.section || '').trim();

                const matchesYear = !filters.targetYears || filters.targetYears.length === 0 || filters.targetYears.includes(sYear);
                const matchesBranch = !filters.targetBranches || filters.targetBranches.length === 0 || filters.targetBranches.includes(sBranch);
                const matchesSection = !filters.targetSections || filters.targetSections.length === 0 || filters.targetSections.includes(sSection);

                return matchesYear && matchesBranch && matchesSection;
            });

            if (targetedStudents.length === 0) return;

            const notifications = targetedStudents.map(student => ({
                userId: student.id,
                type: 'info',
                message: `${title}: ${message}`
            }));

            // Bulk insert DB notifications
            await supabase.from('notifications').insert(notifications);

            // Send emails (Warning: Instant blast, might need queuing for large sets)
            if (emailHtml) {
                for (const student of targetedStudents) {
                    sendEmail({
                        email: student.email,
                        subject: title,
                        message: message,
                        html: emailHtml
                    }).catch(err => console.error(`Email failed for ${student.email}:`, err.message));
                }
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
