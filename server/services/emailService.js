const nodemailer = require('nodemailer');

/**
 * Enhanced Email Service with Deep Debugging
 * Configured to capture full SMTP telemetry for troubleshooting.
 */
const sendEmail = async (options) => {
    try {
        console.log(`--- EMAIL SERVICE: HANDSHAKE INITIATED ---`);
        console.log(`Target: ${options.email}`);
        console.log(`Auth User: ${process.env.EMAIL_USER}`);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('EMAIL_USER or EMAIL_PASS missing from environment variables');
        }

        const rawPass = process.env.EMAIL_PASS;
        const cleanPass = rawPass.trim().replace(/\s+/g, '');
        
        console.log(`Auth Pass Length (raw): ${rawPass.length}`);
        console.log(`Auth Pass Length (cleaned): ${cleanPass.length}`);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER.trim(),
                pass: cleanPass, 
            },
            logger: true,
            debug: true,
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('--- SMTP: VERIFYING CONNECTION ---');
        await transporter.verify();
        console.log('--- SMTP: CONNECTION READY ---');

        const mailOptions = {
            from: `"Weekly Aptitude Test" <${process.env.EMAIL_USER.trim()}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || `<div>${options.message}</div>`
        };

        console.log('--- SMTP: DISPATCHING EMAIL ---');
        const info = await transporter.sendMail(mailOptions);
        console.log(`--- SMTP: DISPATCH SUCCESS [${info.messageId}] ---`);
        return info;
    } catch (error) {
        console.error(`--- SMTP: DISPATCH CRITICAL ERROR ---`);
        console.error(`Error Message: ${error.message}`);
        
        if (error.message.includes('BadCredentials')) {
            console.error('ACTION REQUIRED: Your Gmail App Password is not being accepted.');
            console.error('1. Ensure 2-Step Verification is ON in your Google Account.');
            console.error('2. Generate a NEW App Password and update your .env file.');
        }
        
        throw new Error(`Email Service Failure: ${error.message}`);
    }
};

module.exports = sendEmail;
