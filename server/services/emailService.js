const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For Gmail: You need an App Password
    // For local testing: you can use ethereal.email
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    // Define email options
    const mailOptions = {
        from: `Quiz App <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `<div>${options.message}</div>`
    };

    // Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
