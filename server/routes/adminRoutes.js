const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats, getAllStudents, deleteStudent, getAllAttempts, updateStudent, getStudentDetail } = require('../controllers/adminController');

// All routes here are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllStudents);
router.get('/student/:id', getStudentDetail);
router.put('/users/:id', updateStudent);
router.delete('/users/:id', deleteStudent);
router.get('/history', getAllAttempts);

// Quiz Management
const { generateAIQuestions, createQuiz, getAdminQuizzes, getQuizLeaderboard, analyzePDF } = require('../controllers/quizController');
router.post('/quiz/generate', protect, authorize('admin'), generateAIQuestions);
router.post('/quiz/analyze-pdf', protect, authorize('admin'), upload.single('pdf'), analyzePDF);
router.post('/quiz/upload', protect, authorize('admin'), createQuiz);
router.get('/quizzes', getAdminQuizzes);
router.get('/quiz/:id/leaderboard', getQuizLeaderboard);

module.exports = router;
