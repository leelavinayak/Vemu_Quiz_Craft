import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, KeyRound, ArrowLeft, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('OTP sent to your email');
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-fade-in bg-white">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-blue-600 p-4 rounded-2xl mb-4 shadow-lg shadow-blue-100">
                        <KeyRound className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Recover Access</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Enter email to receive OTP</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Work Email</label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                <Mail size={18} />
                            </span>
                            <input
                                type="email"
                                required
                                className="input-field pl-12 py-4"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-blue w-full flex items-center justify-center space-x-3 py-4 shadow-xl shadow-blue-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <span>Continue</span>
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <Link to="/login" className="text-slate-400 hover:text-blue-600 font-bold flex items-center justify-center space-x-2 text-sm transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Login</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
