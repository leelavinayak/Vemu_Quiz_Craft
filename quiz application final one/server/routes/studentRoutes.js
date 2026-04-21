const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStudentQuizzes } = require('../controllers/quizController');
const { getQuizForAttempt, submitQuiz, getMyResults, getResultDetail } = require('../controllers/studentController');

// Protect student routes
router.use(protect);
router.use(authorize('student'));

router.get('/quizzes', getStudentQuizzes);
router.get('/quiz/:id', getQuizForAttempt);
router.post('/quiz/:id/submit', submitQuiz);
router.get('/results', getMyResults);
router.get('/results/:id', getResultDetail);
// router.put('/profile', updateProfile); // Moved to global auth route

module.exports = router;
