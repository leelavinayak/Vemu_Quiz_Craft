import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
    Users, 
    BookOpen, 
    Trophy, 
    TrendingUp, 
    Clock, 
    BarChart3, 
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/dashboard');
                setData(data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading dashboard...</p>
            </div>
        </div>
    );

    const stats = [
        { label: 'Total Students', value: data?.stats.totalStudents, icon: Users, color: 'bg-blue-600', shadow: 'shadow-blue-100' },
        { label: 'Quizzes Created', value: data?.stats.totalQuizzes, icon: BookOpen, color: 'bg-slate-900', shadow: 'shadow-slate-200' },
        { label: 'Total Attempts', value: data?.stats.totalAttempts, icon: Clock, color: 'bg-blue-600', shadow: 'shadow-blue-100' },
        { label: 'Overall Pass Rate', value: `${data?.stats.passRate}%`, icon: Trophy, color: 'bg-slate-900', shadow: 'shadow-slate-200' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-12 page-enter">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Admin Overview</h1>
                    <p className="text-slate-500 mt-2 text-lg">Real-time performance metrics and student activity.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 stagger-children">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 group animate-fade-in">
                        <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="text-white" size={24} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Bar Chart */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center">
                            <BarChart3 className="mr-3 text-blue-600" /> Quiz Performance
                        </h2>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.quizStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} unit="%" />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 700 }}
                                />
                                <Bar dataKey="avgScore" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={45} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center">
                            <TrendingUp className="mr-3 text-blue-600" /> Recent Attempts
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {data?.recentAttempts.map((attempt, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 hover:bg-blue-50/50 transition-all duration-300 border border-transparent hover:border-blue-100 group"
                            >
                                <div 
                                    className="flex items-center space-x-4 cursor-pointer group/user"
                                    onClick={() => navigate(`/admin/student/${attempt.studentId?._id}`)}
                                    title="View Student Profile"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 group-hover/user:bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-slate-100 transition-colors">
                                        {attempt.studentId?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 group-hover/user:text-blue-600 transition-colors uppercase text-xs tracking-widest">{attempt.studentId?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{attempt.studentId?.email}</p>
                                    </div>
                                </div>
                                <div 
                                    className="flex items-center space-x-6 cursor-pointer group/score"
                                    onClick={() => navigate(`/admin/review-attempt/${attempt._id}`)}
                                    title="Review Quiz Attempt"
                                >
                                    <div className="text-right">
                                        <div className={`text-xl font-black ${attempt.status === 'pass' ? 'text-green-600' : 'text-red-600'} group-hover/score:scale-110 transition-transform`}>
                                            {attempt.percentage}%
                                        </div>
                                        <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                                            <Clock size={10} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-500 tabular-nums">
                                                {formatTime(attempt.timeTaken)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter text-center mt-1">{attempt.quizId?.title}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 transform group-hover/score:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                        {data?.recentAttempts.length === 0 && (
                            <div className="text-center py-20">
                                <Loader2 className="w-10 h-10 mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
