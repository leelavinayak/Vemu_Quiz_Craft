import React from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
                onClick={onClose}
            ></div>
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-scale-up border border-slate-100">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            {type === 'danger' ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
                </div>

                <div className="p-8 bg-slate-50/50 flex space-x-4 border-t border-slate-50">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }} 
                        className={`flex-1 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
