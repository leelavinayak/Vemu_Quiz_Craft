const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { notify } = require('../services/notificationService');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalQuizzes = await Quiz.countDocuments();
        const totalAttempts = await QuizAttempt.countDocuments();
        
        const attempts = await QuizAttempt.find({});
        const passAttempts = attempts.filter(a => a.status === 'pass').length;
        const passRate = totalAttempts > 0 ? (passAttempts / totalAttempts) * 100 : 0;

        // Quiz-wise average scores for bar chart
        const quizStats = await QuizAttempt.aggregate([
            {
                $group: {
                    _id: "$quizId",
                    avgScore: { $avg: "$percentage" }
                }
            },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "quizDetails"
                }
            },
            { $unwind: "$quizDetails" },
            {
                $project: {
                    title: "$quizDetails.title",
                    avgScore: 1
                }
            }
        ]);

        // Recent activity feed
        const recentAttempts = await QuizAttempt.find()
            .populate('studentId', 'name email')
            .populate('quizId', 'title')
            .sort({ percentage: -1, timeTaken: 1, submittedAt: -1 })
            .limit(5);

        res.json({
            stats: {
                totalStudents,
                totalQuizzes,
                totalAttempts,
                passRate: Math.round(passRate)
            },
            quizStats,
            recentAttempts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        
        // Enhance with attempt counts and avg scores
        const enhancedStudents = await Promise.all(students.map(async (student) => {
            const attempts = await QuizAttempt.find({ studentId: student._id });
            const avgScore = attempts.length > 0 
                ? attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length 
                : 0;
            
            return {
                ...student._doc,
                totalAttempts: attempts.length,
                averageScore: Math.round(avgScore)
            };
        }));

        res.json(enhancedStudents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: req.params.id });
            // Optionally delete their attempts too
            await QuizAttempt.deleteMany({ studentId: req.params.id });
            res.json({ message: 'User and all associated data deleted' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all quiz attempts (global history)
// @route   GET /api/admin/history
// @access  Private/Admin
const getAllAttempts = async (req, res) => {
    try {
        const limitRes = req.query.limit;
        const limitValue = (limitRes && limitRes !== 'all') ? parseInt(limitRes) : 0;

        const attempts = await QuizAttempt.find({})
            .populate('studentId', 'name email')
            .populate('quizId', 'title')
            .sort({ percentage: -1, timeTaken: 1, submittedAt: -1 })
            .limit(limitValue);
            
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update fields
        student.name = req.body.name || student.name;
        student.email = req.body.email || student.email;
        student.collegeId = req.body.collegeId || student.collegeId;
        student.collegeName = req.body.collegeName || student.collegeName;
        student.branch = req.body.branch || student.branch;
        student.year = req.body.year || student.year;

        const updatedStudent = await student.save();
        
        // Trigger In-App Notification via Unified Service
        await notify(
            student._id, 
            'info', 
            'Profile Updated', 
            'An administrator has updated your profile details.'
        );

        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed student profile and history
// @route   GET /api/admin/student/:id
// @access  Private/Admin
const getStudentDetail = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const history = await QuizAttempt.find({ studentId: student._id })
            .populate('quizId', 'title language')
            .sort({ submittedAt: -1 });

        // Calculate performance metrics
        const totalAttempts = history.length;
        const avgScore = totalAttempts > 0 
            ? history.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts 
            : 0;
        const passRank = history.filter(h => h.status === 'pass').length;

        res.json({
            student,
            history,
            metrics: {
                totalAttempts,
                averageScore: Math.round(avgScore),
                passRank
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllStudents,
    deleteStudent,
    getAllAttempts,
    updateStudent,
    getStudentDetail
};
