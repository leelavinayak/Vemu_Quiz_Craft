/**
 * Email Templates for Weekly Aptitude Test Platform
 * High-fidelity HTML templates for professional communication.
 * Design Philosophy: Premium, High-Contrast, Data-Driven Aesthetics.
 */

const primaryColor = '#2563eb';
const primaryGradient = 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)';
const darkColor = '#0f172a';
const slateColor = '#64748b';
const lightBg = '#f1f5f9';

const baseTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: ${lightBg}; margin: 0; padding: 20px; color: ${darkColor}; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05); border: 1px solid rgba(226, 232, 240, 0.8); }
        .header { background: ${primaryGradient}; padding: 60px 40px; text-align: center; position: relative; }
        .logo { color: white; font-size: 32px; font-weight: 800; letter-spacing: -0.04em; }
        .logo span { opacity: 0.6; font-weight: 400; }
        .content { padding: 50px 40px; line-height: 1.7; }
        .title { font-size: 30px; font-weight: 800; color: ${darkColor}; margin-bottom: 24px; letter-spacing: -0.02em; line-height: 1.2; }
        .text { font-size: 16px; color: ${slateColor}; margin-bottom: 20px; font-weight: 500; }
        .footer { padding: 40px; text-align: center; font-size: 11px; color: #94a3b8; background: #fafafa; border-top: 1px solid #f1f5f9; }
        .button { display: inline-block; padding: 18px 36px; background-color: ${primaryColor}; color: white !important; border-radius: 18px; font-weight: 700; text-decoration: none; margin-top: 10px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2); }
        .stats-box { background: #f8fafc; border-radius: 24px; padding: 30px; margin: 30px 0; border: 1px solid #e2e8f0; }
        .stat-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .stat-item:last-child { margin-bottom: 0; }
        .stat-label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
        .stat-value { font-size: 15px; font-weight: 800; color: ${darkColor}; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-success { background: #d1fae5; color: #059669; }
        .badge-error { background: #fee2e2; color: #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Weekly Aptitude Test</div>
        </div>
        <div class="content">
            <h1 class="title">${title}</h1>
            ${content}
        </div>
        <div class="footer">
            &copy; 2026 <strong>Weekly Aptitude Test Systems</strong>. All Rights Reserved.<br>
            <p style="margin-top: 10px; opacity: 0.8;">You are receiving this because you hold an active academic identity on our secure cloud nodes.</p>
            <div style="margin-top: 20px;">
                <span style="margin: 0 8px; text-decoration: none; color: ${primaryColor}; font-weight: bold;">Support Center</span>
                <span style="margin: 0 8px; text-decoration: none; color: ${primaryColor}; font-weight: bold;">Privacy Protocol</span>
            </div>
        </div>
    </div>
</body>
</html>
`;

const getWelcomeTemplate = (name) => baseTemplate(`
    <p class="text">Hello <strong>${name}</strong>,</p>
    <p class="text">Your account has been successfully provisioned. You have joined a global network of students leveraging AI for academic growth.</p>
    
    <div style="margin: 30px 0; padding-left: 20px; border-left: 4px solid ${primaryColor};">
        <p style="margin: 10px 0; font-weight: 700; color: ${darkColor};">Next steps for you:</p>
        <p style="font-size: 14px; color: ${slateColor}; margin: 5px 0;">✓ Complete your professional profile</p>
        <p style="font-size: 14px; color: ${slateColor}; margin: 5px 0;">✓ Explore available assessment modules</p>
        <p style="font-size: 14px; color: ${slateColor}; margin: 5px 0;">✓ Link with your academic domain</p>
    </div>

    <a href="${process.env.CLIENT_URL}" class="button">Initialize Portal Access</a>
`, 'Identity Confirmed.');

const getNewQuizTemplate = (quizTitle, language) => baseTemplate(`
    <p class="text">A new intelligence assessment has been deployed to your dashboard environment.</p>
    <div class="stats-box">
        <div class="stat-item">
            <span class="stat-label">Module Title</span>
            <span class="stat-value">${quizTitle}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Target Domain</span>
            <span class="stat-value">${language}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Priority Level</span>
            <span class="badge badge-success">High</span>
        </div>
    </div>
    <p class="text">Early completion is recommended to maintain your performance ranking.</p>
    <a href="${process.env.CLIENT_URL}/student/home" class="button">Begin Assessment Now</a>
`, 'New Deployment.');

const getAttemptStartedTemplate = (quizTitle, studentName, isAdmin = false) => baseTemplate(`
    <p class="text">${isAdmin ? `A student has initiated an assessment session in your domain` : `You have successfully initiated a secure assessment session`}:</p>
    <div class="stats-box">
        <div class="stat-item">
            <span class="stat-label">Subject Identity</span>
            <span class="stat-value">${studentName}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Module</span>
            <span class="stat-value">${quizTitle}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Session Status</span>
            <span class="badge" style="background: #eff6ff; color: #2563eb;">ACTIVE</span>
        </div>
    </div>
    <p class="text">${isAdmin ? 'Real-time telemetry is available in your administration hub.' : 'The clock is active. Minimize distractions until termination.'}</p>
`, 'Session Logic Loaded.');

const getQuizResultTemplate = (quizTitle, studentName, score, percentage, status) => baseTemplate(`
    <p class="text">The assessment session for <strong>${quizTitle}</strong> has been terminated and analyzed.</p>
    <div class="stats-box">
        <div class="stat-item">
            <span class="stat-label">Final Score</span>
            <span class="stat-value" style="color: ${primaryColor}; font-size: 20px;">${score} UNITS</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Accuracy Rating</span>
            <span class="stat-value">${percentage}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Outcome</span>
            <span class="badge ${status === 'pass' ? 'badge-success' : 'badge-error'}">${status.toUpperCase()}</span>
        </div>
    </div>
    <p class="text">Detailed behavioral and academic insights are now available in your history logs.</p>
    <a href="${process.env.CLIENT_URL}/history" class="button">View Analytical Report</a>
`, 'Result Processed.');

const getOTPTemplate = (otp, type = 'register') => baseTemplate(`
    <p class="text">${type === 'register' ? 'A request for new administrative identity has been initiated.' : 'A secure password recovery flow has been triggered for your account.'}</p>
    
    <div style="text-align: center; margin: 40px 0; padding: 40px; background: #f8fafc; border-radius: 28px; border: 2px dashed #cbd5e1;">
        <p style="text-transform: uppercase; font-weight: 800; letter-spacing: 0.15em; color: #94a3b8; font-size: 11px; margin-bottom: 20px;">Secure One-Time Password</p>
        <span style="font-size: 56px; font-weight: 800; color: ${primaryColor}; letter-spacing: 0.2em; display: block; filter: drop-shadow(0 4px 6px rgba(37, 99, 235, 0.1));">${otp}</span>
    </div>
    
    <p style="text-align: center; color: #94a3b8; font-size: 13px; font-weight: 500;">Valid for 10 minutes. If this wasn't you, terminate your session immediately.</p>
`, type === 'register' ? 'Identity Authentication' : 'Security Access Recovery');

module.exports = {
    getWelcomeTemplate,
    getNewQuizTemplate,
    getAttemptStartedTemplate,
    getQuizResultTemplate,
    getOTPTemplate
};
