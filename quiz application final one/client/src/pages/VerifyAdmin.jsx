import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { ShieldAlert, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyAdmin = () => {
    const location = useLocation();
    const email = location.state?.email || '';
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-registration', { email, otp });
            // Save user to localStorage (manual sync since we bypass authContext for simplicity here)
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Admin verified successfully!');
            window.location.href = '/admin/dashboard'; // Force reload to sync context
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
            {/* Left Side: Immersive Visuals */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden mesh-gradient">
                <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
                <div className="relative z-10 w-full h-full p-16 flex flex-col justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/20 backdrop-blur-xl p-2.5 rounded-2xl border border-white/30">
                            <Sparkles className="text-white" size={28} />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tight">AI<span className="text-indigo-300">Quiz</span></span>
                    </div>

                    <div className="max-w-md">
                        <h2 className="text-6xl font-black text-white leading-tight mb-6 animate-slide-right">
                            Finalize Your <br/>
                            <span className="text-indigo-300">Administrative</span> <br/>
                            Access.
                        </h2>
                        <p className="text-lg text-indigo-100/70 font-medium leading-relaxed">
                            Complete the security handshake to activate your governance portal.
                        </p>
                    </div>

                    <p className="text-indigo-200/50 text-[10px] font-black uppercase tracking-[0.3em]">
                        High Fidelity Assessment Architecture
                    </p>
                </div>
            </div>

            {/* Right Side: Verification Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
                 <div className="w-full max-w-md animate-fade-in">
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-slate-900 p-5 rounded-3xl mb-8 shadow-2xl shadow-slate-200 rotate-6 hover:rotate-0 transition-transform duration-500">
                            <ShieldAlert className="text-white w-10 h-10" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Security Check</h1>
                        <p className="text-slate-500 font-medium text-center">Verify the 6-digit code sent to: <br/><span className="text-blue-600 font-black">{email}</span></p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 text-center">Authentication Code</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                className="w-full text-center text-5xl tracking-[0.4em] font-black py-8 bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all rounded-[2rem] outline-none placeholder:text-slate-100"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white rounded-[2rem] py-5 font-black flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    <span>Activate Dashboard</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        
                        <div className="flex items-center justify-center space-x-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Multi-Factor Authentication Active</span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyAdmin;
