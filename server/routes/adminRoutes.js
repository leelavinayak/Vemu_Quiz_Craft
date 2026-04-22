const express = require('express');
const router = express.Router();
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
const { generateAIQuestions, createQuiz, getAdminQuizzes } = require('../controllers/quizController');
router.post('/quiz/generate', generateAIQuestions);
router.post('/quiz/upload', createQuiz);
router.get('/quizzes', getAdminQuizzes);

module.exports = router;
