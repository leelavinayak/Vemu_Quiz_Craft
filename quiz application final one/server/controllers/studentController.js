const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { notify } = require('../services/notificationService');
const templates = require('../utils/emailTemplates');

// @desc    Get single quiz details for attempt
// @route   GET /api/student/quiz/:id
// @access  Private/Student
const getQuizForAttempt = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Check if already attempted
        const existingAttempt = await QuizAttempt.findOne({ 
            studentId: req.user._id, 
            quizId: quiz._id 
        });
        if (existingAttempt) {
            return res.status(400).json({ message: 'Quiz already attempted' });
        }

        // Notify Student and Admin about Attempt Start
        notify(req.user._id, 'info', 'Quiz Started', `You have started "${quiz.title}". Maintain your focus!`, {
            html: templates.getAttemptStartedTemplate(quiz.title, req.user.name)
        });

        notify(quiz.createdBy, 'info', 'Student Attempt Started', `${req.user.name} has started "${quiz.title}".`, {
            html: templates.getAttemptStartedTemplate(quiz.title, req.user.name, true)
        });

        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit quiz answers
// @route   POST /api/student/quiz/:id/submit
// @access  Private/Student
const submitQuiz = async (req, res) => {
    const { answers, timeTaken, isDisqualified } = req.body;
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        let status = 'fail';
        let percentage = 0;

        if (isDisqualified) {
            status = 'disqualified';
            score = 0;
            percentage = 0;
        } else {
            // Calculate score
            quiz.questions.forEach((q) => {
                const answer = answers.find((a) => a.questionId.toString() === q._id.toString());
                if (answer && answer.selectedAnswer === q.correctAnswer) {
                    score++;
                }
            });

            percentage = (score / quiz.questions.length) * 100;
            status = percentage >= quiz.passingScore ? 'pass' : 'fail';
        }

        const attempt = await QuizAttempt.create({
            studentId: req.user._id,
            quizId: req.params.id,
            answers,
            score,
            totalMarks: quiz.questions.length,
            percentage,
            timeTaken,
            status
        });

        // Notify Student of Result
        notify(req.user._id, status === 'pass' ? 'success' : 'warning', 'Assessment Finalized', `You completed "${quiz.title}" with a score of ${percentage}%.`, {
            html: templates.getQuizResultTemplate(quiz.title, req.user.name, score, Math.round(percentage), status)
        });

        // Notify Admin of Result
        notify(quiz.createdBy, 'info', 'New Assessment Result', `${req.user.name} finalized "${quiz.title}" with ${percentage}%.`, {
            html: templates.getQuizResultTemplate(quiz.title, req.user.name, score, Math.round(percentage), status)
        });

        res.status(201).json(attempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all results for logged-in student
// @route   GET /api/student/results
// @access  Private/Student
const getMyResults = async (req, res) => {
    try {
        const limitRes = req.query.limit;
        const limitValue = (limitRes && limitRes !== 'all') ? parseInt(limitRes) : 0;

        const results = await QuizAttempt.find({ studentId: req.user._id })
            .populate('quizId', 'title language')
            .sort({ submittedAt: -1 })
            .limit(limitValue);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single detailed result
// @route   GET /api/student/results/:id
// @access  Private/Student
const getResultDetail = async (req, res) => {
    try {
        const result = await QuizAttempt.findById(req.params.id)
            .populate('quizId', 'title language questions');
        
        if (!result) return res.status(404).json({ message: 'Result not found' });
        
        // Ensure student can only see their own result
        if (result.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private/Student
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.profilePic) user.profilePic = req.body.profilePic;
            
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePic: updatedUser.profilePic
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getQuizForAttempt,
    submitQuiz,
    getMyResults,
    getResultDetail
};
