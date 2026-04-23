const supabase = require('../config/supabase');
const { notifyAllStudents, notify } = require('../services/notificationService');
const templates = require('../utils/emailTemplates');
const pdfParse = require('pdf-parse');
const { generateQuizQuestions, extractQuestionsFromText } = require('../services/quizGenerator');

// @desc    Generate quiz questions via AI
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
            message = 'AI Service is currently unavailable.';
            status = 401;
        }
        res.status(status).json({ message });
    }
};

// @desc    Upload/Create a new quiz
const createQuiz = async (req, res) => {
    try {
        const { title, language, questions, duration, scheduledAt, endTime, passingScore, targetYears, targetBranches, targetSections } = req.body;

        // Calculate if it's live immediately
        const now = new Date();
        const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
        const isLive = !scheduledDate || scheduledDate <= now;

        const { data: quiz, error } = await supabase
            .from('quizzes')
            .insert([{
                title,
                language,
                questions,
                duration,
                scheduledAt: scheduledAt || null,
                endTime: endTime || null,
                isLive: isLive,
                passingScore,
                createdBy: req.user.id,
                targetYears: targetYears || [],
                targetBranches: targetBranches || [],
                targetSections: targetSections || []
            }])
            .select()
            .single();

        if (error) throw error;

        // Notify the Admin (Confirmation)
        await notify(
            req.user.id,
            'success',
            'Quiz Created',
            `You have successfully ${!isLive ? 'scheduled' : 'published'} "${title}".`
        );

        // Notify All Students
        const notificationMessage = !isLive
            ? `A new quiz "${title}" has been scheduled for ${new Date(scheduledAt).toLocaleString()}.`
            : `A new quiz "${title}" is now available for you.`;

        notifyAllStudents(
            !isLive ? 'New Quiz Scheduled' : 'New Assessment Published',
            notificationMessage,
            templates.getNewQuizTemplate(title, language),
            {
                targetYears: targetYears || [],
                targetBranches: targetBranches || [],
                targetSections: targetSections || []
            }
        );

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all quizzes (for admin)
const getAdminQuizzes = async (req, res) => {
    try {
        const { data: quizzes, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('createdBy', req.user.id)
            .order('createdAt', { ascending: false });

        if (error) throw error;
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available quizzes for students
const getStudentQuizzes = async (req, res) => {
    try {
        const now = new Date().toISOString();

        // Quizzes that haven't ended yet
        const { data: quizzes, error } = await supabase
            .from('quizzes')
            .select('*')
            .or(`endTime.gte.${now},endTime.is.null`)
            .order('createdAt', { ascending: false });

        if (error) throw error;

        // Filter quizzes by targeting
        const studentYear = String(req.user.year || '').trim();
        const studentBranch = String(req.user.branch || '').trim();
        const studentSection = String(req.user.section || '').trim();

        const filteredQuizzes = quizzes.filter(quiz => {
            // A quiz matches if the list is empty (Open to All) OR the student matches the list
            const matchesYear = !quiz.targetYears || quiz.targetYears.length === 0 || quiz.targetYears.includes(studentYear);
            const matchesBranch = !quiz.targetBranches || quiz.targetBranches.length === 0 || quiz.targetBranches.includes(studentBranch);
            const matchesSection = !quiz.targetSections || quiz.targetSections.length === 0 || quiz.targetSections.includes(studentSection);

            return matchesYear && matchesBranch && matchesSection;
        });

        // Filter and add attempt status
        const enhancedQuizzes = await Promise.all(filteredQuizzes.map(async (quiz) => {
            // Check if student has already attempted this quiz
            const { data: attempt } = await supabase
                .from('quiz_attempts')
                .select('id')
                .eq('studentId', req.user.id)
                .eq('quizId', quiz.id)
                .maybeSingle(); // Use maybeSingle to avoid errors on empty results

            // Ensure questions have _id for frontend compatibility
            const questionsWithId = quiz.questions?.map((q, idx) => ({
                ...q,
                _id: q._id || idx.toString()
            })) || [];

            return {
                ...quiz,
                _id: quiz.id,
                questions: questionsWithId,
                isAttempted: !!attempt,
                attemptId: attempt ? attempt.id : null
            };
        }));
        res.json(enhancedQuizzes);
    } catch (error) {
        console.error('getStudentQuizzes Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leaderboard for a specific quiz with filters
const getQuizLeaderboard = async (req, res) => {
    try {
        const { id } = req.params;
        const { year, branch, section } = req.query;

        // 1. Get Quiz Details
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', id)
            .single();

        if (quizError || !quiz) return res.status(404).json({ message: 'Quiz not found' });

        // 2. Build Query for attempts
        let query = supabase
            .from('quiz_attempts')
            .select('*, student:users!inner(*)') // Changed alias from studentId to student
            .eq('quizId', id);

        if (year) query = query.filter('student.year', 'eq', year);
        if (branch) query = query.filter('student.branch', 'eq', branch);
        if (section) query = query.filter('student.section', 'eq', section);

        const { data: attempts, error: attemptsError } = await query.order('percentage', { ascending: false }).order('timeTaken', { ascending: true });

        if (attemptsError) throw attemptsError;

        const leaderboard = attempts.map(a => ({
            ...a,
            _id: a.id,
            studentId: { ...a.student, _id: a.student.id } // Use 'student' alias
        }));

        res.json({
            quiz: { ...quiz, _id: quiz.id },
            leaderboard
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Analyze PDF and extract questions
const analyzePDF = async (req, res) => {
    try {
        console.log('PDF Analysis Request Received');
        if (!req.file) {
            console.log('Error: No file in request');
            return res.status(400).json({ message: 'No PDF file provided' });
        }

        console.log(`Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
        const dataBuffer = req.file.buffer;

        // Verify Magic Bytes for PDF (%PDF-)
        const magic = dataBuffer.slice(0, 4).toString();
        if (magic !== '%PDF') {
            console.error(`Invalid file header: ${magic}`);
            return res.status(400).json({ message: 'The uploaded file does not appear to be a valid PDF document. Please check the file format.' });
        }

        let pdfData;
        try {
            pdfData = await pdfParse(dataBuffer);
        } catch (pdfErr) {
            console.error('pdf-parse failed:', pdfErr);
            throw new Error(`Failed to parse PDF document structure: ${pdfErr.message}`);
        }

        const extractedText = pdfData.text;
        console.log(`Extracted text length: ${extractedText?.length || 0}`);

        if (!extractedText || extractedText.trim().length < 50) {
            console.log('Error: Insufficient text extracted');
            return res.status(400).json({ message: 'Could not extract enough text from the PDF. Please ensure it is not an image-only PDF.' });
        }

        console.log('Calling AI for extraction...');
        const questions = await extractQuestionsFromText(extractedText, req.body.numQuestions || 10);
        console.log(`AI successfully extracted ${questions?.length || 0} questions`);

        res.json(questions);
    } catch (error) {
        console.error('PDF Analysis Error Detail:', error);
        res.status(500).json({ message: error.message || 'Failed to analyze PDF' });
    }
};

module.exports = {
    generateAIQuestions,
    createQuiz,
    getAdminQuizzes,
    getStudentQuizzes,
    getQuizLeaderboard,
    analyzePDF
};
