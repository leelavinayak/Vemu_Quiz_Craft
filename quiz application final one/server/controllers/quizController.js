const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { generateQuizQuestions } = require('../services/quizGenerator');
const { notifyAllStudents } = require('../services/notificationService');
const templates = require('../utils/emailTemplates');

// @desc    Generate quiz questions via AI
// @route   POST /api/admin/quiz/generate
// @access  Private/Admin
const generateAIQuestions = async (req, res) => {
    const { language, numQuestions, difficulty } = req.body;
    try {
        if (!language) {
            return res.status(400).json({ message: 'Topic/Language is required' });
        }
        const questions = await generateQuizQuestions(language, numQuestions || 10, difficulty || 'medium');
        res.json(questions);
    } catch (error) {
        console.error('Quiz Generation Error:', error.message);

        let status = 500;
        let message = error.message;

        if (message.includes('API_KEY')) {
            message = 'AI Service is currently unavailable. Please check your API configuration.';
            status = 401;
        } else if (message.includes('safety')) {
            message = 'The requested topic was restricted by AI safety policies. Please try a different subject.';
            status = 400;
        } else if (message.includes('format')) {
            message = 'The AI encountered a layout error. Try being more specific with your topic.';
            status = 422;
        }

        res.status(status).json({ message });
    }
};

// @desc    Upload/Create a new quiz
// @route   POST /api/admin/quiz/upload
// @access  Private/Admin
const createQuiz = async (req, res) => {
    try {
        const { title, language, questions, duration, scheduledAt, endTime, passingScore } = req.body;

        const quiz = await Quiz.create({
            title,
            language,
            questions,
            duration,
            scheduledAt: scheduledAt || null,
            endTime: endTime || null,
            isLive: scheduledAt ? false : true,
            passingScore,
            createdBy: req.user._id
        });

        // Notify All Students
        notifyAllStudents(
            'New Assessment Published',
            `A new quiz "${title}" is now available for you.`,
            templates.getNewQuizTemplate(title, language)
        );

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all quizzes (for admin)
// @route   GET /api/admin/quizzes
// @access  Private/Admin
const getAdminQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available quizzes for students
// @route   GET /api/student/quizzes
// @access  Private/Student
const getStudentQuizzes = async (req, res) => {
    try {
        const now = new Date();
        // Quizzes that are active within their time window
        const quizzes = await Quiz.find({
            $and: [
                {
                    $or: [
                        { isLive: true },
                        { scheduledAt: { $lte: now } },
                        { scheduledAt: null }
                    ]
                },
                {
                    $or: [
                        { endTime: { $gte: now } },
                        { endTime: null }
                    ]
                }
            ]
        }).sort({ scheduledAt: -1, createdAt: -1 });

        // Filter and add attempt status
        const enhancedQuizzes = await Promise.all(quizzes.map(async (quiz) => {
            const attempt = await QuizAttempt.findOne({
                studentId: req.user._id,
                quizId: quiz._id
            });
            return {
                ...quiz._doc,
                isAttempted: !!attempt,
                attemptId: attempt ? attempt._id : null
            };
        }));

        res.json(enhancedQuizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateAIQuestions,
    createQuiz,
    getAdminQuizzes,
    getStudentQuizzes
};
