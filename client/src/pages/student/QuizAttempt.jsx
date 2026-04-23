import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    Clock,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    Loader2
} from 'lucide-react';

const QuizAttempt = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const fetchQuiz = useCallback(async () => {
        try {
            const { data } = await api.get(`/student/quiz/${id}`);
            setQuiz(data);
            setTimeLeft(data.duration * 60);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load quiz');
            navigate('/');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    // Navigation Lock
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (started && !submitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [started, submitting]);

    // Anti-Cheating: Tab/App Switch Detection
    useEffect(() => {
        if (!started || submitting) return;

        const handleCheating = () => {
            if (document.visibilityState === 'hidden' || !document.hasFocus()) {
                console.warn('Security Violation: Tab/App switched.');
                handleSubmit(true); // Trigger disqualification
            }
        };

        document.addEventListener('visibilitychange', handleCheating);
        window.addEventListener('blur', handleCheating);

        return () => {
            document.removeEventListener('visibilitychange', handleCheating);
            window.removeEventListener('blur', handleCheating);
        };
    }, [started, submitting, quiz]);

    // Timer Logic
    useEffect(() => {
        if (!started || timeLeft <= 0 || submitting) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [started, timeLeft, submitting]);

    const handleSubmit = async (isDisqualified = false) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const timeTaken = (quiz.duration * 60) - timeLeft;
            const { data } = await api.post(`/student/quiz/${id}/submit`, {
                answers,
                timeTaken,
                isDisqualified
            });

            if (isDisqualified) {
                toast.error('DISQUALIFIED: Security violation detected (tab/app switch).', { duration: 5000 });
            }

            navigate(`/result/${data._id}`);
        } catch (err) {
            toast.error('Submission failed');
            setSubmitting(false);
        }
    };

    const handleOptionSelect = (option) => {
        const newAnswers = [...answers];
        const existingIndex = newAnswers.findIndex(a => a.questionId === quiz.questions[currentQuestion]._id);

        if (existingIndex > -1) {
            newAnswers[existingIndex].selectedAnswer = option;
        } else {
            newAnswers.push({
                questionId: quiz.questions[currentQuestion]._id,
                selectedAnswer: option
            });
        }
        setAnswers(newAnswers);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Preparing assessment...</p>
            </div>
        </div>
    );

    if (!started) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="bg-white max-w-2xl w-full p-12 rounded-[3rem] border border-slate-100 shadow-sm animate-scale-up">
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-blue-600 p-5 rounded-2xl shadow-xl shadow-blue-100 mb-8 rotate-3 animate-pulse-glow">
                            <AlertTriangle className="text-white" size={40} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">{quiz.title}</h1>
                        <div className="flex space-x-8 mb-10">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items</p>
                                <p className="text-2xl font-black text-slate-800">{quiz.questions.length}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Minutes</p>
                                <p className="text-2xl font-black text-slate-800">{quiz.duration}m</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                                <p className="text-2xl font-black text-slate-800">{quiz.passingScore}%</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-left mb-10 w-full">
                            <h3 className="font-black text-slate-800 mb-4 flex items-center text-sm uppercase tracking-widest">
                                <CheckCircle2 size={18} className="mr-2 text-blue-600" /> Exam Rules
                            </h3>
                            <ul className="text-sm text-slate-500 space-y-3 font-bold">
                                <li className="flex items-start"><span className="text-red-500 mr-2">!</span> Any tab or application switch will cause immediate DISQUALIFICATION.</li>
                                <li className="flex items-start"><span className="text-blue-600 mr-2">•</span> Precision is key; the timer runs continuously.</li>
                                <li className="flex items-start"><span className="text-blue-600 mr-2">•</span> Automatic submission occurs at zero seconds.</li>
                                <li className="flex items-start"><span className="text-blue-600 mr-2">•</span> Ensure a stable connection before proceeding.</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => setStarted(true)}
                            className="btn-blue w-full py-5 text-xl flex items-center justify-center space-x-3"
                        >
                            <span>Begin Certification</span>
                            <ArrowRight size={24} />
                        </button>
                        <button onClick={() => navigate('/')} className="mt-6 text-slate-400 font-bold hover:text-blue-600 transition-colors uppercase text-xs tracking-widest">Return Home</button>
                    </div>
                </div>
            </div>
        );
    }

    const q = quiz.questions[currentQuestion];
    const selectedOpt = answers.find(a => a.questionId === q._id)?.selectedAnswer;
    const answeredCount = answers.length;

    return (
        <div className="min-h-screen bg-white p-6 flex flex-col items-center">
            <div className="max-w-5xl w-full">
                {/* Header with Timer */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 mb-10 flex justify-between items-center sticky top-6 z-40 shadow-sm backdrop-blur-xl">
                    <div className="flex items-center space-x-6">
                        <div className="bg-blue-600 px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-widest">
                            {currentQuestion + 1} of {quiz.questions.length}
                        </div>
                        <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden hidden lg:block">
                            <div
                                className="h-full bg-blue-600 transition-all duration-700 rounded-full"
                                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                            ></div>
                        </div>
                        <div className="hidden md:flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <CheckCircle2 size={14} className="text-blue-600" />
                            <span>{answeredCount}/{quiz.questions.length} Answered</span>
                        </div>
                    </div>

                    <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-black text-2xl border-2 transition-all ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                        <Clock size={24} />
                        <span className="tabular-nums">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* Question Area */}
                <div key={currentQuestion} className="bg-white p-12 rounded-[3rem] border border-slate-100 mb-10 animate-fade-in min-h-[450px] flex flex-col shadow-sm">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-12 leading-tight tracking-tight">
                        {q.question}
                    </h2>

                    <div className="grid grid-cols-1 gap-5 flex-1">
                        {q.options.map((opt, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleOptionSelect(opt)}
                                className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 flex items-center group ${selectedOpt === opt
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.01]'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black mr-6 shrink-0 transition-all ${selectedOpt === opt ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="text-xl font-bold tracking-tight">{opt}</span>
                                {selectedOpt === opt && <CheckCircle2 size={28} className="ml-auto" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Navigator (dots) */}
                <div className="flex justify-center gap-2 mb-6 flex-wrap">
                    {quiz.questions.map((_, idx) => {
                        const isAnswered = answers.some(a => a.questionId === quiz.questions[idx]._id);
                        const isCurrent = idx === currentQuestion;
                        return (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${isCurrent
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                                        : isAnswered
                                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                        disabled={currentQuestion === 0}
                        className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-black transition-all uppercase text-xs tracking-widest ${currentQuestion === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={submitting || answers.length === 0}
                            className={`btn-blue px-12 py-4 text-xl flex items-center space-x-3 ${submitting ? 'opacity-50' : ''}`}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                            <span>Finish Exam</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestion(prev => prev + 1)}
                            className="btn-blue px-12 py-4 text-xl flex items-center space-x-3"
                        >
                            <span>Next</span>
                            <ArrowRight size={24} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizAttempt;
