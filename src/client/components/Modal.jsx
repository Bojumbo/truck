import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={[
          'relative z-10 w-full sm:max-w-lg',
          'bg-slate-800 border border-slate-700',
          'rounded-t-3xl sm:rounded-3xl',
          'p-6 pb-8 sm:pb-6',
          'animate-slide-up',
          'max-h-[90dvh] overflow-y-auto',
          className,
        ].join(' ')}
      >
        {/* Handle bar (mobile) */}
        <div className="sm:hidden w-12 h-1 bg-slate-600 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-50">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
