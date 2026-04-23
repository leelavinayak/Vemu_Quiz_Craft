import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    User,
    Mail,
    School,
    BookOpen,
    Calendar,
    Briefcase,
    ArrowLeft,
    TrendingUp,
    CheckCircle2,
    Clock,
    ChevronRight,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const { data } = await api.get(`/admin/student/${id}`);
                setData(data);
            } catch (err) {
                toast.error('Failed to load student details');
                navigate('/admin/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [id, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retrieving intelligence...</p>
            </div>
        </div>
    );

    if (!data || !data.student) return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-slate-50">
            <div className="w-20 h-20 bg-white shadow-xl shadow-red-100 text-red-500 rounded-[2rem] flex items-center justify-center text-3xl font-black border border-red-50">!</div>
            <div className="text-center">
                <p className="text-slate-800 font-black text-xl tracking-tight">Record Structure Mismatch</p>
                <p className="text-slate-400 text-sm font-medium mt-1">The student data could not be parsed correctly.</p>
            </div>
            <button onClick={() => navigate('/admin/users')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                Return to Directory
            </button>
        </div>
    );

    const {
        student = { name: 'Unknown Student', email: '', collegeName: '', branch: '', collegeId: '', year: '', section: '' },
        history = [],
        metrics = { totalAttempts: 0, averageScore: 0, passRank: 0 }
    } = data || {};

    return (
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 page-enter">
            <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold mb-6 md:mb-10 transition-all group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Back to Overview</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8 text-center sticky top-28">
                        <div className="relative inline-block mb-4 md:mb-6">
                            {student.profilePic ? (
                                <img src={student.profilePic} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] object-cover ring-8 ring-blue-50" alt="" />
                            ) : (
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-600 text-white rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl md:text-5xl font-black shadow-2xl shadow-blue-100">
                                    {student.name ? student.name.charAt(0) : 'U'}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white shadow-sm font-black flex items-center justify-center text-white text-[8px] md:text-[10px]">✓</div>
                        </div>

                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-1">{student.name}</h2>
                        <p className="text-blue-600 font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-blue-50 py-1.5 px-4 rounded-full inline-block mb-6 md:mb-8">Registered Student</p>

                        <div className="space-y-4 text-left border-t border-slate-50 pt-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="font-bold text-slate-700 truncate">{student.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <School size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">College / Institution</p>
                                    <p className="font-bold text-slate-700">{student.collegeName || 'Not Specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <Briefcase size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course / Branch</p>
                                    <p className="font-bold text-slate-700">{student.branch || 'Not Specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <BookOpen size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">College ID / Roll No</p>
                                    <p className="font-bold text-slate-700">{student.collegeId || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</p>
                                        <p className="font-bold text-slate-700">{student.year || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                        <div className="font-black text-xs">#</div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</p>
                                        <p className="font-bold text-slate-700">{student.section || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analytics & History */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="bg-slate-900 rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white">
                            <TrendingUp className="text-blue-400 mb-4" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance Index</p>
                            <p className="text-2xl md:text-3xl font-black">{metrics.averageScore}%</p>
                        </div>
                        <div className="bg-blue-600 rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-blue-100">
                            <CheckCircle2 className="text-blue-200 mb-4" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Quizzes Passed</p>
                            <p className="text-2xl md:text-3xl font-black">{metrics.passRank}</p>
                        </div>
                        <div className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
                            <Clock className="text-slate-400 mb-4" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Attempts</p>
                            <p className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalAttempts}</p>
                        </div>
                    </div>

                    {/* Recent Attempts List */}
                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10">
                        <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-8 tracking-tight flex items-center">
                            <BookOpen className="mr-3 text-blue-600" size={20} /> Assessment History
                        </h3>

                        <div className="space-y-3">
                            {history.map((attempt) => (
                                <div
                                    key={attempt._id}
                                    onClick={() => navigate(`/admin/review-attempt/${attempt._id}`)}
                                    className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-slate-50 group cursor-pointer hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                                >
                                    <div className="flex items-center space-x-3 md:space-x-4">
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${attempt.status === 'pass' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {attempt.status === 'pass' ? 'P' : 'F'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase text-[9px] md:text-[10px] tracking-widest truncate max-w-[120px] sm:max-w-none">{attempt.quizId?.title}</p>
                                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">{new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 md:space-x-6">
                                        <div className="text-right">
                                            <p className={`text-base md:text-xl font-black ${attempt.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>{attempt.percentage}%</p>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Result</p>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-200 group-hover:translate-x-1 transition-transform hidden sm:block" />
                                    </div>
                                </div>
                            ))}

                            {history.length === 0 && (
                                <div className="text-center py-20 text-slate-200 font-black uppercase tracking-widest text-[10px]">
                                    No assessment records found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
