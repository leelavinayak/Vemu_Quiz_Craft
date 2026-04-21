import React from 'react';
import { 
    Mail, 
    MapPin, 
    Phone, 
    Code2,
    Globe,
    Share2,
    Sparkles
} from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 pt-20 pb-10 px-6 relative overflow-hidden">
            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Mission */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                                <Sparkles className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">Quiz<span className="text-blue-500">Craft</span></span>
                        </div>
                        <p className="text-slate-400 font-bold text-sm leading-relaxed">
                            Empowering academic excellence through AI-driven intelligence and secure assessment protocols.
                        </p>
                        <div className="flex items-center space-x-4">
                            <a href="https://instagram.com/vemuitchittoor" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Globe size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Share2 size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Globe size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Institutional Profile */}
                    <div className="space-y-6">
                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs">Our Institution</h4>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 group">
                                <MapPin className="text-blue-500 shrink-0 mt-0.5 group-hover:animate-bounce" size={18} />
                                <p className="text-slate-400 text-sm font-bold leading-snug">
                                    Vemu Institute of Technology<br/>
                                    P. Kothakota, Chittoor (Dist),<br/>
                                    Andhra Pradesh - 517112
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="text-blue-500" size={18} />
                                <p className="text-slate-400 text-sm font-bold">+91 8886661148 / 49</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="text-blue-500" size={18} />
                                <p className="text-slate-400 text-sm font-bold">programmers@gmail.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="space-y-6">
                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs">Quick Access</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-slate-400 hover:text-blue-500 font-bold text-sm transition-colors uppercase tracking-widest text-[10px]">Infrastructure</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-500 font-bold text-sm transition-colors uppercase tracking-widest text-[10px]">Security Protocol</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-500 font-bold text-sm transition-colors uppercase tracking-widest text-[10px]">Privacy Node</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-500 font-bold text-sm transition-colors uppercase tracking-widest text-[10px]">API Status</a></li>
                        </ul>
                    </div>

                    {/* Team Credits */}
                    <div className="space-y-6 p-8 bg-slate-800/50 rounded-[2.5rem] border border-white/5">
                        <div className="flex items-center space-x-3 mb-2">
                            <Code2 className="text-blue-500" size={24} />
                            <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs">The Programmers Club</h4>
                        </div>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed">
                            Crafted with passion by the student innovator team at Vemu IT. Developing the future of digital education.
                        </p>
                        <div className="pt-2">
                             <span className="inline-flex items-center space-x-2 text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                <Code2 size={12} />
                                <span>Innovation Hub</span>
                             </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        &copy; 2026 QuizCraft Platform. Developed by the Programmers Club Team.
                    </p>
                    <div className="flex items-center space-x-6">
                         <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white cursor-pointer transition-colors">Terminals</span>
                         <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white cursor-pointer transition-colors">Compliance</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
